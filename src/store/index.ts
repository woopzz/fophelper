import { combineReducers, configureStore, type Action, type ThunkAction } from '@reduxjs/toolkit';

import PaymentReducer from './slices/payments';
import ActReducer from './slices/acts';
import MatchingsReducer from './slices/matchings';
import extstorageReducer, { type ExternalStorage } from './slices/extstorage';
import NotificationReducer from './slices/notification';

const rootReducer = combineReducers({
    payments: PaymentReducer,
    acts: ActReducer,
    matchings: MatchingsReducer,
    extstorage: extstorageReducer,
    notification: NotificationReducer,
});

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
