import CustomError from '../../../models/CustomError';
import { type AppThunkAction } from '../..';
import { changeSyncStatus } from '../extstorage';
import { notify } from '../notification';
import { type Payment } from '../../../models/Payment';
import { type Matching } from '../../../models/Matching';
import { addActs } from '../acts';
import { addPayments } from '../payments';
import { addMatchings } from '../matchings';

export default function syncGD(): AppThunkAction {
    return async function (dispatch, getState) {
        let state = getState();

        const { proxy } = state.extstorage;
        if (!proxy) {
            dispatch(
                notify({
                    message: 'Синхронізацію скасовано. Взаємодія з Google сервісами не налаштована.',
                    type: 'info',
                }),
            );
            return;
        }

        if (state.extstorage.syncStatus === 'pending') {
            return;
        }
        dispatch(changeSyncStatus('pending'));

        const hasPaymentsBeforeSync = state.payments.ids.length > 0;

        console.debug('run sync');
        try {
            const newPayments = await proxy.getAllPayments();
            if (newPayments.length > 0) {
                dispatch(addPayments(newPayments));
                state = getState();
            }

            const newActs = await proxy.getAllActs();
            if (newActs.length > 0) {
                dispatch(addActs(newActs));
            }

            const newMatchings = await proxy.getAllMatchings();
            if (newMatchings.length > 0) {
                dispatch(addMatchings(newMatchings));
                state = getState();
            }

            if (hasPaymentsBeforeSync) {
                proxy.setPayments(state.payments.ids.map((paymentId) => state.payments.entities[paymentId] as Payment));
                proxy.setMatchings(
                    state.matchings.ids
                        .map((matchingId) => state.matchings.entities[matchingId] as Matching)
                        .filter((matching) => matching.active),
                );
            }
            dispatch(changeSyncStatus('succeeded'));
            dispatch(notify({ message: 'Синхронізація успішна', type: 'info' }));
        } catch (error) {
            console.error(error);
            dispatch(changeSyncStatus('failed'));

            let message = 'Помилка синхронізації';
            if (error instanceof CustomError && error.message) {
                message = error.message;
            }
            dispatch(notify({ message, type: 'error' }));
        }
    };
}
