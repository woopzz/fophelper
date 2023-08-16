import { useCallback, useReducer } from 'react';
import { downloadFile, fetchBSLsCSV, getOrCreateRootFolder } from '../services/googleDrive';
import { loadPaymentsFromString } from '../services/bsl_csv';
import { appendPayments } from '../slices/payments';
import { useAppDispatch } from './store';

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
    const dispatch = useAppDispatch();

    const sync = useCallback(async () => {
        if (state.status === 'pending') {
            return;
        }
        console.debug('run sync');
        try {
            const rootFolderId = await getOrCreateRootFolder();
            console.log('rootFolderId =', rootFolderId);
            const bslFileId = await fetchBSLsCSV({ rootFolderId });
            const rawCSV = await downloadFile({ fileId: bslFileId });
            console.log(rawCSV);

            const payments = loadPaymentsFromString(rawCSV);
            dispatch(appendPayments(payments));
        } catch (error) {
            console.debug('sync error: ', error);
            stateDispatch({ type: 'failure', message: 'Помилка синхронізації' });
        }
    }, [state]);

    return { state, sync };
}

export default useGoogleDrive;
