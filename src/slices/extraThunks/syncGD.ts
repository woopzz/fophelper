import { type ThunkAction, type Action } from '@reduxjs/toolkit';

import {
    dumpMatchings,
    dumpPayments,
    loadMatchingsFromString,
    loadPaymentsFromString,
} from '../../services/payment_csv';
import { createGD, downloadGD, searchGD, uploadGD } from '../../services/googleDrive';
import { appendPayments } from '../payments';
import { type RootState } from '../../store';
import { changeSyncStatus } from '../gapi';
import { notify } from '../notification';
import {
    GD_ACTS_FOLDER_NAME,
    GD_FOLDER_MIMETYPE,
    GD_MATCHING_CSV_NAME,
    GD_PAYMENT_CSV_NAME,
    GD_PDF_MIMETYPE,
    GD_ROOT_FOLDER_NAME,
} from '../../data';
import CustomError from '../../models/CustomError';
import { type Payment } from '../../models/Payment';
import { type Act } from '../../models/Act';
import { appendActs } from '../acts';
import { appendMatchings } from '../matchings';
import { type Matching } from '../../models/Matching';

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

            let paymentsFileId = await getFileId({
                query: `name = '${GD_PAYMENT_CSV_NAME}' and '${rootFolderId}' in parents and trashed = false`,
            });
            if (paymentsFileId !== null) {
                const rawCSV = await downloadGD({ fileId: paymentsFileId });
                dispatch(appendPayments(loadPaymentsFromString(rawCSV)));
                state = getState();
            } else {
                paymentsFileId = await createFileMetadata({
                    resource: {
                        name: GD_PAYMENT_CSV_NAME,
                        parents: [rootFolderId],
                    },
                });
            }

            const actsFolderId = await getOrCreateFolder({
                name: GD_ACTS_FOLDER_NAME,
                parentId: rootFolderId,
            });

            const newActs = await getActs({ parentId: actsFolderId });
            if (newActs.length > 0) {
                dispatch(appendActs(newActs));
            }

            let matchingsFileId = await getFileId({
                query: `name = '${GD_MATCHING_CSV_NAME}' and '${rootFolderId}' in parents and trashed = false`,
            });
            if (matchingsFileId !== null) {
                const rawCSV = await downloadGD({ fileId: matchingsFileId });
                dispatch(appendMatchings(loadMatchingsFromString(rawCSV)));
                state = getState();
            } else {
                matchingsFileId = await createFileMetadata({
                    resource: {
                        name: GD_MATCHING_CSV_NAME,
                        parents: [rootFolderId],
                    },
                });
            }

            if (hasPaymentsBeforeSync) {
                await uploadGD({
                    name: GD_PAYMENT_CSV_NAME,
                    fileId: paymentsFileId,
                    body: dumpPayments(
                        state.payments.ids.map((paymentId) => state.payments.entities[paymentId] as Payment),
                    ),
                });
                await uploadGD({
                    name: GD_MATCHING_CSV_NAME,
                    fileId: matchingsFileId,
                    body: dumpMatchings(
                        state.matchings.ids
                            .map((matchingId) => state.matchings.entities[matchingId] as Matching)
                            .filter((matching) => matching.active),
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

async function createFileMetadata({
    resource,
}: {
    resource: Parameters<typeof createGD>[0]['resource'];
}): Promise<GD_FILE_ID> {
    const createResult = await createGD({ resource, fields: 'id' });

    if (createResult.id) {
        return createResult.id;
    }

    throw new CustomError(`Новий файл створено, але інформація про нього невідома.`);
}

async function getFileId({ query }: { query: string }): Promise<GD_FILE_ID | null> {
    const searchResult = await searchGD({
        q: query,
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

    throw new CustomError('Помилка отримання інформації про файл.');
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