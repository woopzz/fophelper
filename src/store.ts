import { combineReducers, configureStore } from '@reduxjs/toolkit';

import PaymentReducer from './slices/payments';
import ActReducer from './slices/acts';
import MatchingsReducer from './slices/matchings';
import GapiReducer from './slices/gapi';
import NotificationReducer from './slices/notification';

const rootReducer = combineReducers({
    payments: PaymentReducer,
    acts: ActReducer,
    matchings: MatchingsReducer,
    gapi: GapiReducer,
    notification: NotificationReducer,
});

export function setupStore() {
    return configureStore({
        reducer: rootReducer,
    });
}

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = ReturnType<typeof setupStore>['dispatch'];
