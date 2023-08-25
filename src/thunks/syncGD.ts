import { type ThunkAction, type Action } from '@reduxjs/toolkit';

import { dumpPayments, loadPaymentsFromString } from '../services/payment_csv';
import { createGD, downloadGD, searchGD, uploadGD } from '../services/googleDrive';
import { appendPayments } from '../slices/payments';
import { type RootState } from '../store';
import { changeSyncStatus } from '../slices/gapi';
import { notify } from '../slices/notification';
import {
    GD_ACTS_FOLDER_NAME,
    GD_FOLDER_MIMETYPE,
    GD_PAYMENT_CSV_NAME,
    GD_PDF_MIMETYPE,
    GD_ROOT_FOLDER_NAME,
} from '../data';
import CustomError from '../models/CustomError';
import { type Payment } from '../models/Payment';
import { type Act } from '../models/Act';
import { appendActs } from '../slices/acts';

export default function syncGD(): ThunkAction<void, RootState, unknown, Action> {
    return async function (dispatch, getState) {
        let state = getState();

        if (state.gapi.syncStatus === 'pending') {
            return;
        }
        dispatch(changeSyncStatus('pending'));

        const hasPaymentsBeforeSync = state.payments.ids.length > 0;

        console.debug('run sync');
        try {
            const rootFolderId = await getOrCreateFolder({
                name: GD_ROOT_FOLDER_NAME,
                parentId: 'root',
            });

            let paymentsFileId = await getPaymentsCSV({ rootFolderId });
            if (paymentsFileId !== null) {
                const rawCSV = await downloadGD({ fileId: paymentsFileId });
                dispatch(appendPayments(loadPaymentsFromString(rawCSV)));
                state = getState();
            } else {
                paymentsFileId = await createPaymentCsvMetadata({ parentId: rootFolderId });
            }

            const actsFolderId = await getOrCreateFolder({
                name: GD_ACTS_FOLDER_NAME,
                parentId: rootFolderId,
            });

            const newActs = await getActs({ parentId: actsFolderId });
            if (newActs.length > 0) {
                dispatch(appendActs(newActs));
            }

            if (hasPaymentsBeforeSync) {
                await uploadGD({
                    fileId: paymentsFileId,
                    body: dumpPayments(
                        state.payments.ids.map((paymentId) => state.payments.entities[paymentId] as Payment),
                    ),
                });
            }
            dispatch(changeSyncStatus('succeeded'));
            dispatch(notify({ message: 'Синхронізація успішна', type: 'info' }));
        } catch (error) {
            dispatch(changeSyncStatus('failed'));

            let message = 'Помилка синхронізації.';
            if (error instanceof CustomError && error.message) {
                message = error.message;
            }
            dispatch(notify({ message, type: 'error' }));
        }
    };
}

async function getOrCreateFolder({ name, parentId }: { name: string; parentId: GD_FILE_ID }): Promise<GD_FILE_ID> {
    const searchResult = await searchGD({
        q: `mimeType = "${GD_FOLDER_MIMETYPE}" and name = "${name}" and trashed = false and "${parentId}" in parents`,
        fields: 'files(id)',
    });
    const found = searchResult.length > 0;
    const rootFolderId = found && searchResult[0].id;

    if (rootFolderId) {
        return rootFolderId;
    }

    if (found) {
        throw new CustomError(`Директорію "${name}" знайдено, але інформація про неї невідома.`);
    }

    const createResult = await createGD({
        resource: {
            name,
            mimeType: GD_FOLDER_MIMETYPE,
            parents: [parentId],
        },
        fields: 'id',
    });

    if (createResult.id) {
        return createResult.id;
    }

    throw new CustomError(`Директорію "${name}" створено, але інформація про неї невідома.`);
}

async function getPaymentsCSV({ rootFolderId }: { rootFolderId: GD_FILE_ID }): Promise<GD_FILE_ID | null> {
    const searchResult = await searchGD({
        q: `name = '${GD_PAYMENT_CSV_NAME}' and '${rootFolderId}' in parents and trashed = false`,
        fields: 'files(id)',
    });
    const found = searchResult.length > 0;
    const fileId = found && searchResult[0].id;

    if (fileId) {
        return fileId;
    }

    if (!found) {
        return null;
    }

    throw new CustomError('Помилка отримання інформації про CSV файл з платежами.');
}

async function createPaymentCsvMetadata({ parentId }: { parentId: GD_FILE_ID }): Promise<GD_FILE_ID> {
    const createResult = await createGD({
        resource: {
            name: GD_PAYMENT_CSV_NAME,
            parents: [parentId],
        },
        fields: 'id',
    });

    if (createResult.id) {
        return createResult.id;
    }

    throw new CustomError('Новий CSV файл для платежів створено, але інформація про нього невідома.');
}

async function getActs({ parentId }: { parentId: GD_FILE_ID }): Promise<Act[]> {
    const searchResult = await searchGD({
        q: `mimeType = "${GD_PDF_MIMETYPE}" and "${parentId}" in parents and trashed = false`,
        fields: 'files(id, name, webViewLink)',
    });

    const acts: Act[] = [];
    for (let i = 0; i < searchResult.length; i++) {
        const { name, id: gdId, webViewLink: gdWebViewLink } = searchResult[i];
        if (!gdId || !name || !gdWebViewLink) {
            throw new CustomError('Один з актів не містить всієї потрібної інформації.');
        }
        acts.push({ name, gdId, gdWebViewLink });
    }

    return acts;
}
