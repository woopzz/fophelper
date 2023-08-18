import { useCallback, useReducer } from 'react';
import {
    createFileMetadata,
    downloadFile,
    fetchBSLsCSV,
    getOrCreateRootFolder,
    uploadFileContent,
} from '../services/googleDrive';
import { dumpPayments, loadPaymentsFromString } from '../services/bsl_csv';
import { appendPayments } from '../slices/payments';
import { useAppDispatch, useAppSelector } from './store';

type State = { status: 'pending' } | { status: 'synced' } | { status: 'error'; message: string };
type Action = { type: 'runSync' } | { type: 'success' } | { type: 'failure'; message: string };

const initState: State = {
    status: 'synced',
};

const stateReducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'runSync':
            return { status: 'pending' };
        case 'success':
            return { status: 'synced' };
        case 'failure':
            return { status: 'error', message: action.message };
        default:
            return state;
    }
};

function useGoogleDrive() {
    const [state, stateDispatch] = useReducer(stateReducer, initState);
    const allPayments = useAppSelector((state) => state.payments.allPayments);
    const dispatch = useAppDispatch();

    const sync = useCallback(async () => {
        if (state.status === 'pending') {
            return;
        }
        const paymentsToUpload = [...allPayments];

        console.debug('run sync');
        try {
            const rootFolderId = await getOrCreateRootFolder();

            let bslFileId = await fetchBSLsCSV({ rootFolderId });
            if (bslFileId !== null) {
                const rawCSV = await downloadFile({ fileId: bslFileId });

                const newPayments = loadPaymentsFromString(rawCSV);
                dispatch(appendPayments(newPayments));
                paymentsToUpload.push(...newPayments);
            } else {
                bslFileId = await createFileMetadata({ parentId: rootFolderId });
            }

            if (allPayments.length > 0) {
                await uploadFileContent({
                    fileId: bslFileId,
                    body: dumpPayments(paymentsToUpload),
                });
            }
        } catch (error) {
            console.debug('sync error: ', error);
            stateDispatch({ type: 'failure', message: 'Помилка синхронізації' });
        }
    }, [state, allPayments, dispatch]);

    return { state, sync };
}

export default useGoogleDrive;
