import { useCallback, useReducer } from 'react';

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
    const [state, dispatch] = useReducer(stateReducer, initState);

    const sync = useCallback(() => {
        if (state.status === 'pending') {
            return;
        }
        console.log('run sync');
    }, [state]);

    return { state, sync };
}

export default useGoogleDrive;
