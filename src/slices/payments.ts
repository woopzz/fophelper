import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { sortPaymentsByDate, type Payment } from '../models/BankStatementLine';

interface State {
    list: Payment[];
}

const initialState: State = {
    list: [],
};

export const paymentsSlice = createSlice({
    name: 'payments',
    initialState,
    reducers: {
        appendPayments: (state, action: PayloadAction<Payment[]>) => {
            const newPayments = action.payload;

            const mapDocNoOnPayment = new Map<Payment['docNo'], Payment>();
            for (const payment of [...state.list, ...newPayments]) {
                mapDocNoOnPayment.set(payment.docNo, payment);
            }

            state.list = sortPaymentsByDate(Array.from(mapDocNoOnPayment.values()), { reverse: true });
        },
    },
});

export const { appendPayments } = paymentsSlice.actions;

export default paymentsSlice.reducer;
