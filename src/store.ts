import { configureStore } from '@reduxjs/toolkit';
import PaymentReducer from './slices/payments';
import ActReducer from './slices/acts';
import GapiReducer from './slices/gapi';
import NotificationReducer from './slices/notification';

const store = configureStore({
    reducer: {
        payments: PaymentReducer,
        acts: ActReducer,
        gapi: GapiReducer,
        notification: NotificationReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
