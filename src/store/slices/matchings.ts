import { createEntityAdapter, createSelector, createSlice, type EntityId, type PayloadAction } from '@reduxjs/toolkit';

import { calcMatchingId, type Matching } from '../../models/Matching';
import { type RootState } from '..';

export type MatchingEssential = Omit<Matching, 'id' | 'active'>;

const matchingsAdapter = createEntityAdapter<Matching>({
    selectId: (matching) => matching.id,
    sortComparer: (a, b) => a.paymentId.toString().localeCompare(b.paymentId.toString()),
});

const matchingsSlice = createSlice({
    name: 'matchings',
    initialState: matchingsAdapter.getInitialState(),
    reducers: {
        appendMatchings: (state, action: PayloadAction<MatchingEssential[]>) => {
            const matchings = action.payload.map((values) => makeMatching(values));
            matchingsAdapter.addMany(state, matchings);
        },
        removeMatching: (state, action: PayloadAction<EntityId>) => {
            const matching = state.entities[action.payload];
            if (matching) {
                matching.active = false;
            }
        },
    },
});

export const { appendMatchings, removeMatching } = matchingsSlice.actions;

const { selectAll } = matchingsAdapter.getSelectors<RootState>((state) => state.matchings);

export const selectAllMatchings = createSelector([selectAll], (allMatchings) => allMatchings.filter((x) => x.active));

export default matchingsSlice.reducer;

const makeMatching = (matching: MatchingEssential): Matching => {
    return Object.assign({}, matching, {
        id: calcMatchingId(matching.paymentId, matching.actId),
        active: true,
    });
};
