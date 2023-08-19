import { Action, PayloadAction, ThunkAction, createSlice } from '@reduxjs/toolkit';
import { NOTIFICATION_DELAY_MS } from '../data';
import { RootState } from '../store';

type Notification = {
    message: string;
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
            state.notification = null;
        },
    },
});

const { addNotification, dismissNotification } = notificationSlice.actions;
export { dismissNotification };

export default notificationSlice.reducer;

export function notify(message: Notification['message']): ThunkAction<void, RootState, unknown, Action> {
    return async function (dispatch) {
        const timeoutId = setTimeout(() => dispatch(dismissNotification()), NOTIFICATION_DELAY_MS);
        dispatch(addNotification({ message, timeoutId }));
    };
}

function clearNotificationTimeout(notification: State['notification']) {
    if (notification) {
        clearTimeout(notification.timeoutId);
    }
}
