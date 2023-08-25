import { createEntityAdapter, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { type Payment } from '../models/Payment';
import { calcQuarter } from '../utils';
import { type RootState } from '../store';

const paymentsAdapter = createEntityAdapter<Payment>({
    selectId: (payment) => payment.docNo,
    sortComparer: (a, b) => b.time - a.time,
});

interface BaseState {
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

const initialState = paymentsAdapter.getInitialState<BaseState>(calcInitialBaseState());

type State = typeof initialState;

export const paymentsSlice = createSlice({
    name: 'payments',
    initialState: initialState,
    reducers: {
        appendPayments: (state, action: PayloadAction<Payment[]>) => {
            paymentsAdapter.addMany(state, action.payload);
            state.lastFiscalPeriodInfo.total = calcLastFiscalPeriodTotal(state);
            state.averageIncome = calcAverageIncome(state);
        },
    },
});

export const { appendPayments } = paymentsSlice.actions;

export const { selectAll: selectAllPayments } = paymentsAdapter.getSelectors<RootState>((state) => state.payments);

export default paymentsSlice.reducer;

function calcInitialBaseState(): BaseState {
    const now = new Date();

    let quarter = calcQuarter(now) - 1;
    let year = now.getFullYear();
    if (quarter === -1) {
        quarter = 4;
        year -= 1;
    }

    return {
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
    const { ids: paymentIds, entities: paymentIdToPayment, lastFiscalPeriodInfo } = state;
    const { quarter, year } = lastFiscalPeriodInfo;

    return paymentIds.reduce<number>((acum, paymentId) => {
        const payment = paymentIdToPayment[paymentId] as Payment;
        const date = new Date(payment.time);
        if (date.getFullYear() === year && payment.quarter === quarter) {
            acum += payment.amount;
        }
        return acum;
    }, 0);
}

function calcAverageIncome(state: State): State['averageIncome'] {
    const { ids: paymentIds, entities: paymentIdToPayment } = state;

    const now = new Date();

    const currentYear = now.getFullYear();
    const previousYear = currentYear - 1;

    let currentTotal = 0;
    let previousTotal = 0;

    let currentCount = 0;
    let previousCount = 0;

    for (let i = 0; i < paymentIds.length; i++) {
        const payment = paymentIdToPayment[paymentIds[i]] as Payment;
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
