import { type PayloadAction, createSlice } from '@reduxjs/toolkit';

interface State {
    syncStatus: 'idle' | 'pending' | 'succeeded' | 'failed';
}

const initialState: State = {
    syncStatus: 'idle',
};

export const gapiSlice = createSlice({
    name: 'gapi',
    initialState,
    reducers: {
        changeSyncStatus: (state, action: PayloadAction<State['syncStatus']>) => {
            state.syncStatus = action.payload;
        },
    },
});

export const { changeSyncStatus } = gapiSlice.actions;

export default gapiSlice.reducer;
