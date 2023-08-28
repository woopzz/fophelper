import { useSelector } from 'react-redux';

import MUIPaper from '@mui/material/Paper';

import { ListView } from '../components/ListView';
import { type Payment } from '../models/Payment';
import { selectAllPayments } from '../slices/payments';

export const PaymentsPage = () => {
    const allPayments = useSelector(selectAllPayments);
    return (
        <MUIPaper>
            <ListView<Payment>
                records={allPayments}
                fieldsInfo={[
                    { key: 'dateStr', label: 'Дата', getDisplayValue: getPaymentDate },
                    { key: 'amount', label: 'Сума, грн', getDisplayValue: getPaymentAmount, align: 'right' },
                    { key: 'note', label: 'Призначення', getDisplayValue: getPaymentNote },
                ]}
                getRecordKey={getRecordKey}
            />
        </MUIPaper>
    );
};

function getRecordKey(payment: Payment): React.Key {
    return payment.docNo;
}

function getPaymentDate(payment: Payment): string {
    return payment.dateStr;
}

function getPaymentAmount(payment: Payment): string {
    return payment.amountStr;
}

function getPaymentNote(payment: Payment): string {
    return payment.note;
}
