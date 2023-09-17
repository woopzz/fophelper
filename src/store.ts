import { combineReducers, configureStore, type Action, type ThunkAction } from '@reduxjs/toolkit';

import PaymentReducer from './slices/payments';
import ActReducer from './slices/acts';
import MatchingsReducer from './slices/matchings';
import GapiReducer from './slices/gapi';
import NotificationReducer from './slices/notification';
import { type GoogleApi } from './gateways/GoogleApi';

const rootReducer = combineReducers({
    payments: PaymentReducer,
    acts: ActReducer,
    matchings: MatchingsReducer,
    gapi: GapiReducer,
    notification: NotificationReducer,
});

export function setupStore({ googleApi }: { googleApi: GoogleApi }) {
    return configureStore({
        reducer: rootReducer,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                thunk: {
                    extraArgument: { googleApi },
                },
            }),
    });
}

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = ReturnType<typeof setupStore>['dispatch'];

type ThunkActionExtraArg = {
    googleApi: GoogleApi;
};
export type AppThunkAction = ThunkAction<void, RootState, ThunkActionExtraArg, Action>;
