import { type Action, type PayloadAction, type ThunkAction, createSlice } from '@reduxjs/toolkit';

import { NOTIFICATION_DELAY_MS } from '../../data';
import { type RootState } from '..';

type Notification = {
    message: string;
    type: 'info' | 'error';
    timeoutId: ReturnType<typeof setTimeout>;
};

interface State {
    notification: Notification | null;
}

const state: State = {
    notification: null,
};

const notificationSlice = createSlice({
    name: 'notification',
    initialState: state,
    reducers: {
        addNotification: (state, action: PayloadAction<Notification>) => {
            clearNotificationTimeout(state.notification);
            state.notification = action.payload;
        },
        dismissNotification: (state) => {
            clearNotificationTimeout(state.notification);
            if (state.notification !== null) {
                state.notification = null;
            }
        },
    },
});

const { addNotification, dismissNotification } = notificationSlice.actions;
export { dismissNotification };

export default notificationSlice.reducer;

export function notify(notification: Omit<Notification, 'timeoutId'>): ThunkAction<void, RootState, unknown, Action> {
    return async function (dispatch) {
        const timeoutId = setTimeout(() => dispatch(dismissNotification()), NOTIFICATION_DELAY_MS);
        dispatch(addNotification({ ...notification, timeoutId }));
    };
}

function clearNotificationTimeout(notification: State['notification']) {
    if (notification) {
        clearTimeout(notification.timeoutId);
    }
}
