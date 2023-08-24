import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { sortPaymentsByDate, type Payment } from '../models/Payment';
import { calcQuarter, omitDuplicates } from '../utils';

interface State {
    allPayments: Payment[];
    lastFiscalPeriodInfo: {
        quarter: number;
        year: number;
        total: number;
    };
    averageIncome: {
        currentYear: {
            year: number;
            total: number;
        };
        previousYear: {
            year: number;
            total: number;
        };
    };
}

export const paymentsSlice = createSlice({
    name: 'payments',
    initialState: calcInitialState(),
    reducers: {
        appendPayments: (state, action: PayloadAction<Payment[]>) => {
            const newPayments = action.payload;
            const payments = [...state.allPayments, ...newPayments];
            state.allPayments = sortPaymentsByDate(omitDuplicates(payments, 'docNo'), { reverse: true });
            state.lastFiscalPeriodInfo.total = calcLastFiscalPeriodTotal(state);
            state.averageIncome = calcAverageIncome(state);
        },
    },
});

export const { appendPayments } = paymentsSlice.actions;

export default paymentsSlice.reducer;

function calcInitialState(): State {
    const now = new Date();

    let quarter = calcQuarter(now) - 1;
    let year = now.getFullYear();
    if (quarter === -1) {
        quarter = 4;
        year -= 1;
    }

    return {
        allPayments: [],
        lastFiscalPeriodInfo: { quarter, year, total: 0 },
        averageIncome: {
            currentYear: {
                year: year,
                total: 0,
            },
            previousYear: {
                year: year - 1,
                total: 0,
            },
        },
    };
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

function calcAverageIncome(state: State): State['averageIncome'] {
    const { allPayments } = state;

    const now = new Date();

    const currentYear = now.getFullYear();
    const previousYear = currentYear - 1;

    let currentTotal = 0;
    let previousTotal = 0;

    let currentCount = 0;
    let previousCount = 0;

    for (let i = 0; i < allPayments.length; i++) {
        const payment = allPayments[i];
        const date = new Date(payment.time);
        const year = date.getFullYear();
        if (year === currentYear) {
            currentTotal += payment.amount;
            currentCount++;
        } else if (year === previousYear) {
            previousTotal += payment.amount;
            previousCount++;
        }
    }

    return {
        currentYear: {
            year: currentYear,
            total: currentCount && currentTotal / currentCount,
        },
        previousYear: {
            year: previousYear,
            total: previousCount && previousTotal / previousCount,
        },
    };
}
