import { ChangeEventHandler, useRef, useState } from 'react';

import { CssBaseline, Input } from '@mui/material';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { BankStatementList } from './BankStatementList';
import { Payment, sortPaymentsByDate } from '../models/BankStatementLine';
import { loadPayments } from '../services/bsl_csv';

export const App = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const inputEl = useRef<HTMLInputElement>(null);

    const handleImportButtonClick = () => inputEl.current?.click();

    const handleFileInputChange: ChangeEventHandler<HTMLInputElement> = async (ev) => {
        const files = ev.target.files;
        if (files !== null && files.length > 0) {
            const newPayments = await loadPayments(files[0]);

            const mapDocNoOnPayment = new Map<Payment['docNo'], Payment>();
            for (const payment of [...payments, ...newPayments]) {
                mapDocNoOnPayment.set(payment.docNo, payment);
            }
            setPayments(sortPaymentsByDate(Array.from(mapDocNoOnPayment.values()), { reverse: true }));
        }
    };

    return (
        <>
            <CssBaseline />
            <Container maxWidth="lg">
                <Input type="file" onChange={handleFileInputChange} inputRef={inputEl} sx={{ display: 'none' }} />
                <Button variant="contained" onClick={handleImportButtonClick}>
                    Import bank statements
                </Button>
                <BankStatementList payments={payments} />
            </Container>
        </>
    );
};
