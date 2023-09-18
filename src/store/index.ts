import { combineReducers, configureStore, type Action, type ThunkAction } from '@reduxjs/toolkit';

import PaymentReducer from './slices/payments';
import ActReducer from './slices/acts';
import MatchingsReducer, { type MatchingEssential } from './slices/matchings';
import GapiReducer from './slices/gapi';
import NotificationReducer from './slices/notification';
import type { Payment } from '../models/Payment';
import type { Act } from '../models/Act';

const rootReducer = combineReducers({
    payments: PaymentReducer,
    acts: ActReducer,
    matchings: MatchingsReducer,
    gapi: GapiReducer,
    notification: NotificationReducer,
});

export interface ExternalStorage {
    getAllPayments: () => Promise<Payment[]>;
    getAllActs: () => Promise<Act[]>;
    getAllMatchings: () => Promise<MatchingEssential[]>;
    setPayments: (payments: Payment[]) => Promise<void>;
    setMatchings: (matchings: MatchingEssential[]) => Promise<void>;
}

export function setupStore({ extstorage }: { extstorage: ExternalStorage }) {
    return configureStore({
        reducer: rootReducer,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                thunk: {
                    extraArgument: { extstorage },
                },
            }),
    });
}

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = ReturnType<typeof setupStore>['dispatch'];

type ThunkActionExtraArg = {
    extstorage: ExternalStorage;
};
export type AppThunkAction = ThunkAction<void, RootState, ThunkActionExtraArg, Action>;
