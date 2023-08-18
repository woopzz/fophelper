import { ThunkAction, Action } from '@reduxjs/toolkit';
import { dumpPayments, loadPaymentsFromString } from '../services/bsl_csv';
import {
    createFileMetadata,
    downloadFile,
    fetchBSLsCSV,
    getOrCreateRootFolder,
    uploadFileContent,
} from '../services/googleDrive';
import { appendPayments } from '../slices/payments';
import { RootState } from '../store';
import { changeSyncStatus } from '../slices/gapi';

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

            let bslFileId = await fetchBSLsCSV({ rootFolderId });
            if (bslFileId !== null) {
                const rawCSV = await downloadFile({ fileId: bslFileId });
                dispatch(appendPayments(loadPaymentsFromString(rawCSV)));
                state = getState();
            } else {
                bslFileId = await createFileMetadata({ parentId: rootFolderId });
            }

            if (hasPaymentsBeforeSync) {
                await uploadFileContent({
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
