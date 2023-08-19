import { ThunkAction, Action } from '@reduxjs/toolkit';
import { dumpPayments, loadPaymentsFromString } from '../services/bsl_csv';
import { createGD, downloadGD, searchGD, uploadGD } from '../services/googleDrive';
import { appendPayments } from '../slices/payments';
import { RootState } from '../store';
import { changeSyncStatus } from '../slices/gapi';
import { GD_FOLDER_MIMETYPE, GD_PAYMENT_CSV_NAME, GD_ROOT_FOLDER_NAME } from '../data';
import CustomError from '../models/CustomError';

export default function syncGD(): ThunkAction<void, RootState, unknown, Action> {
    return async function (dispatch, getState) {
        let state = getState();

        if (state.gapi.syncStatus === 'pending') {
            return;
        }

        const hasPaymentsBeforeSync = state.payments.allPayments.length > 0;

        console.debug('run sync');
        try {
            const rootFolderId = await getOrCreateRootFolder();

            let bslFileId = await getPaymentsCSV({ rootFolderId });
            if (bslFileId !== null) {
                const rawCSV = await downloadGD({ fileId: bslFileId });
                dispatch(appendPayments(loadPaymentsFromString(rawCSV)));
                state = getState();
            } else {
                bslFileId = await createPaymentCsvMetadata({ parentId: rootFolderId });
            }

            if (hasPaymentsBeforeSync) {
                await uploadGD({
                    fileId: bslFileId,
                    body: dumpPayments(state.payments.allPayments),
                });
            }
            dispatch(changeSyncStatus('succeeded'));
        } catch (error) {
            console.debug('sync error: ', error);
            dispatch(changeSyncStatus('failed'));
        }
    };
}

export async function getOrCreateRootFolder(): Promise<GD_FILE_ID> {
    const searchResult = await searchGD({
        q: `mimeType = "${GD_FOLDER_MIMETYPE}" and name = "${GD_ROOT_FOLDER_NAME}" and trashed = false and "root" in parents`,
        fields: 'files(id)',
    });
    const found = searchResult.length > 0;
    const rootFolderId = found && searchResult[0].id;

    if (rootFolderId) {
        return rootFolderId;
    }

    if (found) {
        throw new CustomError('Основну директорію знайдено, але інформація про неї невідома.');
    }

    const createResult = await createGD({
        resource: {
            name: GD_ROOT_FOLDER_NAME,
            mimeType: GD_FOLDER_MIMETYPE,
        },
        fields: 'id',
    });

    if (createResult.id) {
        return createResult.id;
    }

    throw new CustomError('Основну директорію створено, але інформація про неї невідома.');
}

export async function getPaymentsCSV({ rootFolderId }: { rootFolderId: GD_FILE_ID }): Promise<GD_FILE_ID | null> {
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

export async function createPaymentCsvMetadata({ parentId }: { parentId: GD_FILE_ID }): Promise<GD_FILE_ID> {
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
