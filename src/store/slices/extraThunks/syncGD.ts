import CustomError from '../../../models/CustomError';
import { type AppThunkAction } from '../..';
import { changeSyncStatus } from '../extstorage';
import { notify } from '../notification';
import { type Payment } from '../../../models/Payment';
import { type Matching } from '../../../models/Matching';
import { appendActs } from '../acts';
import { appendPayments } from '../payments';
import { appendMatchings } from '../matchings';

export default function syncGD(): AppThunkAction {
    return async function (dispatch, getState, { extstorage }) {
        let state = getState();

        if (state.extstorage.syncStatus === 'pending') {
            return;
        }
        dispatch(changeSyncStatus('pending'));

        const hasPaymentsBeforeSync = state.payments.ids.length > 0;

        console.debug('run sync');
        try {
            const newPayments = await extstorage.getAllPayments();
            if (newPayments.length > 0) {
                dispatch(appendPayments(newPayments));
                state = getState();
            }

            const newActs = await extstorage.getAllActs();
            if (newActs.length > 0) {
                dispatch(appendActs(newActs));
            }

            const newMatchings = await extstorage.getAllMatchings();
            if (newMatchings.length > 0) {
                dispatch(appendMatchings(newMatchings));
                state = getState();
            }

            if (hasPaymentsBeforeSync) {
                extstorage.setPayments(
                    state.payments.ids.map((paymentId) => state.payments.entities[paymentId] as Payment),
                );
                extstorage.setMatchings(
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

            let message = 'Помилка синхронізації.';
            if (error instanceof CustomError && error.message) {
                message = error.message;
            }
            dispatch(notify({ message, type: 'error' }));
        }
    };
}
