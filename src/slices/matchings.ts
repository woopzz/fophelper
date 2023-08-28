import { createEntityAdapter, createSlice, type EntityId, type PayloadAction } from '@reduxjs/toolkit';

import { type Matching } from '../models/Matching';
import { type RootState } from '../store';

const matchingsAdapter = createEntityAdapter<Matching>({
    selectId: (matching) => matching.id,
    sortComparer: (a, b) => a.paymentId.toString().localeCompare(b.paymentId.toString()),
});

const matchingsSlice = createSlice({
    name: 'matchings',
    initialState: matchingsAdapter.getInitialState(),
    reducers: {
        appendMatchings: (state, action: PayloadAction<Matching[]>) => {
            matchingsAdapter.addMany(state, action.payload);
        },
        removeMatching: (state, action: PayloadAction<EntityId>) => {
            matchingsAdapter.removeOne(state, action.payload);
        },
    },
});

export const { appendMatchings, removeMatching } = matchingsSlice.actions;

export const { selectAll: selectAllMatchings } = matchingsAdapter.getSelectors<RootState>((state) => state.matchings);

export default matchingsSlice.reducer;
