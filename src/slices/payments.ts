import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { sortPaymentsByDate, type Payment } from '../models/BankStatementLine';

interface State {
    allPayments: Payment[];
}

const initialState: State = {
    allPayments: [],
};

export const paymentsSlice = createSlice({
    name: 'payments',
    initialState,
    reducers: {
        appendPayments: (state, action: PayloadAction<Payment[]>) => {
            const newPayments = action.payload;

            const mapDocNoOnPayment = new Map<Payment['docNo'], Payment>();
            for (const payment of [...state.allPayments, ...newPayments]) {
                mapDocNoOnPayment.set(payment.docNo, payment);
            }

            state.allPayments = sortPaymentsByDate(Array.from(mapDocNoOnPayment.values()), { reverse: true });
        },
    },
});

export const { appendPayments } = paymentsSlice.actions;

export default paymentsSlice.reducer;
