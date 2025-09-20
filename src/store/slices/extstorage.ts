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

type SYNC_STATUS = 'idle' | 'pending' | 'succeeded' | 'failed';
export const DEFAULT_SYNC_STATUS: SYNC_STATUS = 'idle';

interface State {
    proxy: ExternalStorage | null;
    syncStatus: SYNC_STATUS;
}

export const initialState: State = {
    proxy: null,
    syncStatus: DEFAULT_SYNC_STATUS,
};

export const extstorageSlice = createSlice({
    name: 'extstorage',
    initialState,
    reducers: {
        changeSyncStatus: (state, action: PayloadAction<State['syncStatus']>) => {
            if (state.proxy) {
                state.syncStatus = action.payload;
            }
        },
    },
});

export const { changeSyncStatus } = extstorageSlice.actions;

export default extstorageSlice.reducer;
