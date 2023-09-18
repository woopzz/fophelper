import { type PayloadAction, createSlice } from '@reduxjs/toolkit';
import { type Payment } from '../../models/Payment';
import { type MatchingEssential } from './matchings';
import { type Act } from '../../models/Act';

export interface ExternalStorage {
    getAllPayments: () => Promise<Payment[]>;
    getAllActs: () => Promise<Act[]>;
    getAllMatchings: () => Promise<MatchingEssential[]>;
    setPayments: (payments: Payment[]) => Promise<void>;
    setMatchings: (matchings: MatchingEssential[]) => Promise<void>;
}

interface State {
    syncStatus: 'idle' | 'pending' | 'succeeded' | 'failed';
}

const initialState: State = {
    syncStatus: 'idle',
};

export const extstorageSlice = createSlice({
    name: 'extstorage',
    initialState,
    reducers: {
        changeSyncStatus: (state, action: PayloadAction<State['syncStatus']>) => {
            state.syncStatus = action.payload;
        },
    },
});

export const { changeSyncStatus } = extstorageSlice.actions;

export default extstorageSlice.reducer;
