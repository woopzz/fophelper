import { createEntityAdapter, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { type Matching } from '../models/Matching';
import { type RootState } from '../store';

const matchingsAdapter = createEntityAdapter<Matching>({
    selectId: (matching) => `${matching.paymentId}-${matching.actId}`,
    sortComparer: (a, b) => a.paymentId.localeCompare(b.paymentId),
});

const matchingsSlice = createSlice({
    name: 'matchings',
    initialState: matchingsAdapter.getInitialState(),
    reducers: {
        appendMatchings: (state, action: PayloadAction<Matching[]>) => {
            matchingsAdapter.addMany(state, action.payload);
        },
    },
});

export const { appendMatchings } = matchingsSlice.actions;

export const { selectAll: selectAllMatchings } = matchingsAdapter.getSelectors<RootState>((state) => state.matchings);

export default matchingsSlice.reducer;
