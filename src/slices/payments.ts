import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { sortPaymentsByDate, type Payment } from '../models/BankStatementLine';
import { calcQuarter } from '../utils';

interface State {
    allPayments: Payment[];
    lastFiscalPeriodInfo: {
        quarter: number;
        year: number;
        total: number;
    };
}

const initialState: State = {
    allPayments: [],
    lastFiscalPeriodInfo: calcInitLastFiscalPeriodInfo(),
};

export const paymentsSlice = createSlice({
    name: 'payments',
    initialState,
    reducers: {
        appendPayments: (state, action: PayloadAction<Payment[]>) => {
            const newPayments = action.payload;
            const payments = [...state.allPayments, ...newPayments];
            state.allPayments = sortPaymentsByDate(omitDuplicates(payments), { reverse: true });
            state.lastFiscalPeriodInfo.total = calcLastFiscalPeriodTotal(state);
        },
    },
});

export const { appendPayments } = paymentsSlice.actions;

export default paymentsSlice.reducer;

function calcInitLastFiscalPeriodInfo(): State['lastFiscalPeriodInfo'] {
    const now = new Date();

    let quarter = calcQuarter(now) - 1;
    let year = now.getFullYear();
    if (quarter === -1) {
        quarter = 4;
        year -= 1;
    }

    return { quarter, year, total: 0 };
}

function omitDuplicates(payments: Payment[]): Payment[] {
    const mapDocNoOnPayment = new Map<Payment['docNo'], Payment>();
    for (const payment of payments) {
        mapDocNoOnPayment.set(payment.docNo, payment);
    }
    return Array.from(mapDocNoOnPayment.values());
}

function calcLastFiscalPeriodTotal(state: State): State['lastFiscalPeriodInfo']['total'] {
    const { lastFiscalPeriodInfo, allPayments } = state;
    const { quarter, year } = lastFiscalPeriodInfo;
    return allPayments.reduce((acum, payment) => {
        const date = new Date(payment.time);
        if (date.getFullYear() === year && payment.quarter === quarter) {
            acum += payment.amount;
        }
        return acum;
    }, 0);
}
