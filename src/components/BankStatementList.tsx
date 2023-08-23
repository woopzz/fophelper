import { useRef, ChangeEventHandler } from 'react';

import Input from '@mui/material/Input';
import Paper from '@mui/material/Paper';
import MuiToolbar from '@mui/material/Toolbar';
import MuiIconButton from '@mui/material/IconButton';
import MuiUploadIcon from '@mui/icons-material/Upload';

import { Payment } from '../models/BankStatementLine';
import { loadPaymentsFromFile } from '../services/bsl_csv';
import { useAppDispatch, useAppSelector } from '../hooks/store';
import { appendPayments } from '../slices/payments';
import { ListView } from './ListView';

export const BankStatementList = () => {
    const { allPayments } = useAppSelector((state) => state.payments);
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
        <Paper>
            <MuiToolbar variant="dense">
                <Input type="file" onChange={handleFileInputChange} inputRef={inputEl} sx={{ display: 'none' }} />
                <MuiIconButton onClick={handleImportButtonClick} sx={{ marginLeft: 'auto' }}>
                    <MuiUploadIcon />
                </MuiIconButton>
            </MuiToolbar>
            <ListView<Payment>
                records={allPayments}
                fieldsInfo={[
                    { key: 'dateStr', label: 'Дата', getDisplayValue: getPaymentDate },
                    { key: 'amount', label: 'Сума, грн', getDisplayValue: getPaymentAmount, align: 'right' },
                    { key: 'note', label: 'Призначення', getDisplayValue: getPaymentNote },
                ]}
                getRecordKey={getRecordKey}
            />
        </Paper>
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
