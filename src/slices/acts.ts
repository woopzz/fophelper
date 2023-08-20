import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { Act } from '../models/Act';
import { omitDuplicates } from '../utils';

interface State {
    allActs: Act[];
}

const state: State = {
    allActs: [],
};

const actsSlice = createSlice({
    name: 'acts',
    initialState: state,
    reducers: {
        appendActs: (state, action: PayloadAction<Act[]>) => {
            const newActs = action.payload;
            state.allActs = sortByName(omitDuplicates(newActs, 'name'));
        },
    },
});

export const { appendActs } = actsSlice.actions;

export default actsSlice.reducer;

function sortByName(acts: Act[]) {
    return acts.sort((a, b) => (a.name > b.name ? 1 : -1));
}
