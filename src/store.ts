import { configureStore } from '@reduxjs/toolkit';
import PaymentReducer from './slices/payments';

const store = configureStore({
    reducer: {
        payments: PaymentReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
