import { createSelector, type EntityId } from '@reduxjs/toolkit';

import { selectAllPayments } from '../payments';
import { selectAllMatchings } from '../matchings';

export const selectUnmatchedPayments = createSelector(
    [selectAllPayments, selectAllMatchings],
    (allPayments, allMatchings) => {
        const matchedPaymentIds = new Set<EntityId>();
        for (let i = 0; i < allMatchings.length; i++) {
            const matching = allMatchings[i];
            if (matching) {
                matchedPaymentIds.add(matching.paymentId);
            }
        }

        return allPayments.filter((x) => !matchedPaymentIds.has(x.docNo));
    },
);
