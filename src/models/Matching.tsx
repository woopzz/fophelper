import { type Act } from './Act';
import { type Payment } from './Payment';

export type Matching = {
    paymentId: Payment['docNo'];
    actId: Act['gdId'];
};
