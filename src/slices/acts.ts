import { type PayloadAction, createSlice, createEntityAdapter } from '@reduxjs/toolkit';

import { type Act } from '../models/Act';
import { type RootState } from '../store';

const actsAdapter = createEntityAdapter<Act>({
    selectId: (act) => act.gdId,
    sortComparer: (a, b) => (a.name > b.name ? -1 : 1),
});

const initialState = actsAdapter.getInitialState();

const actsSlice = createSlice({
    name: 'acts',
    initialState,
    reducers: {
        appendActs: (state, action: PayloadAction<Act[]>) => {
            actsAdapter.addMany(state, action.payload);
        },
    },
});

export const { appendActs } = actsSlice.actions;

export const { selectAll: selectAllActs, selectById: selectActById } = actsAdapter.getSelectors<RootState>(
    (state) => state.acts,
);

export default actsSlice.reducer;
