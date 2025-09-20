import { combineReducers, configureStore, type Action, type ThunkAction } from '@reduxjs/toolkit';

import PaymentReducer from './slices/payments';
import ActReducer from './slices/acts';
import MatchingsReducer from './slices/matchings';
import extstorageReducer, { type ExternalStorage, initialState as extstorageInitialState } from './slices/extstorage';
import NotificationReducer from './slices/notification';

export type { ExternalStorage };

const rootReducer = combineReducers({
    payments: PaymentReducer,
    acts: ActReducer,
    matchings: MatchingsReducer,
    extstorage: extstorageReducer,
    notification: NotificationReducer,
});

export function setupStore(extstorage: ExternalStorage | null) {
    return configureStore({
        preloadedState: {
            extstorage: Object.assign({}, extstorageInitialState, { proxy: extstorage }),
        },
        reducer: rootReducer,
    });
}

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = ReturnType<typeof setupStore>['dispatch'];

export type AppThunkAction = ThunkAction<void, RootState, unknown, Action>;
