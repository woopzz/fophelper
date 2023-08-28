import type { EntityId } from '@reduxjs/toolkit';

export type Matching = {
    id: EntityId;
    paymentId: EntityId;
    actId: EntityId;
    active: boolean;
};

export const calcMatchingId = (paymentId: EntityId, actId: EntityId) => {
    return `${paymentId}-${actId}`;
};
