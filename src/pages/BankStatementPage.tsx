import { ChangeEventHandler, memo, useRef } from 'react';

import MUIPaper from '@mui/material/Paper';
import MUIButton from '@mui/material/Button';
import MUIInput from '@mui/material/Input';
import MuiUploadIcon from '@mui/icons-material/Upload';

import { ActionButtons } from '../components/ActionButtons';
import { ListView } from '../components/ListView';
import { Payment } from '../models/BankStatementLine';
import { useAppDispatch, useAppSelector } from '../hooks/store';
import { loadPaymentsFromFile } from '../services/bsl_csv';
import { appendPayments } from '../slices/payments';

export const BankStatementPage = () => {
    const { allPayments } = useAppSelector((state) => state.payments);
    return (
        <MUIPaper>
            <ActionButtons buttons={<UploadActionButton />} />
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

const UploadActionButton = memo(function UploadActionButton() {
    const dispatch = useAppDispatch();

    const inputEl = useRef<HTMLInputElement>(null);

    const handleImportButtonClick = () => inputEl.current?.click();

    const handleFileInputChange: ChangeEventHandler<HTMLInputElement> = async (ev) => {
        const files = ev.target.files;
        if (files !== null && files.length > 0) {
            const newPayments = await loadPaymentsFromFile(files[0]);
            dispatch(appendPayments(newPayments));
        }
    };

    return (
        <>
            <MUIInput type="file" onChange={handleFileInputChange} inputRef={inputEl} sx={{ display: 'none' }} />
            <MUIButton variant="outlined" startIcon={<MuiUploadIcon />} onClick={handleImportButtonClick}>
                Завантажити CSV
            </MUIButton>
        </>
    );
});

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
