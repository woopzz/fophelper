import { useState, useRef, ChangeEventHandler } from 'react';

import useTheme from '@mui/material/styles/useTheme';
import Input from '@mui/material/Input';
import Paper from '@mui/material/Paper';
import MuiBox from '@mui/material/Box';
import MuiToolbar from '@mui/material/Toolbar';
import MuiIconButton from '@mui/material/IconButton';
import MuiSwitch from '@mui/material/Switch';
import MuiUploadIcon from '@mui/icons-material/Upload';
import MuiTableRowsIcon from '@mui/icons-material/TableRows';
import MuiDrawer from '@mui/material/Drawer';
import MuiList from '@mui/material/List';
import MuiListItem from '@mui/material/ListItem';
import MuiListItemText from '@mui/material/ListItemText';
import MuiListSubheader from '@mui/material/ListSubheader';

import { Payment, CSV_FIELD_TO_PAYMENT_CSV_FIELD, PaymentFieldsFromCsv } from '../models/BankStatementLine';
import useWindowInnerWidth from '../hooks/useWindowInnerWidth';
import { loadPaymentsFromFile } from '../services/bsl_csv';
import { useAppDispatch, useAppSelector } from '../hooks/store';
import { appendPayments } from '../slices/payments';
import { ListView } from './ListView';
import { Act } from '../models/Act';

const SIDE_SHEET_WIDTH = 256;

export const BankStatementList = () => {
    const theme = useTheme();
    const screenWidth = useWindowInnerWidth();

    const { allPayments, lastFiscalPeriodInfo } = useAppSelector((state) => state.payments);
    const { allActs } = useAppSelector((state) => state.acts);
    const dispatch = useAppDispatch();

    const [shownColumns, setShownColumns] = useState<Array<PaymentFieldsFromCsv>>(['dateStr', 'note', 'amountStr']);
    const [showColumnsSideSheet, setShowColumnsSideSheet] = useState(false);

    const inputEl = useRef<HTMLInputElement>(null);

    const handleImportButtonClick = () => inputEl.current?.click();

    const handleFileInputChange: ChangeEventHandler<HTMLInputElement> = async (ev) => {
        const files = ev.target.files;
        if (files !== null && files.length > 0) {
            const newPayments = await loadPaymentsFromFile(files[0]);
            dispatch(appendPayments(newPayments));
        }
    };

    const toggleShownColumns = (column: PaymentFieldsFromCsv) => {
        if (shownColumns.includes(column)) {
            setShownColumns(shownColumns.filter((x) => x !== column));
        } else {
            setShownColumns([...shownColumns, column]);
        }
    };

    const shouldDisplayDrawerPermanently = (screenWidth - theme.breakpoints.values.lg) / 2 > SIDE_SHEET_WIDTH;

    const buttonshowColumnsSideSheet = !shouldDisplayDrawerPermanently && (
        <MuiIconButton onClick={() => setShowColumnsSideSheet(!showColumnsSideSheet)}>
            <MuiTableRowsIcon />
        </MuiIconButton>
    );

    return (
        <Paper>
            <div>
                {lastFiscalPeriodInfo.year} / {lastFiscalPeriodInfo.quarter}: {lastFiscalPeriodInfo.total.toFixed(2)}
            </div>
            <MuiToolbar variant="dense">
                <Input type="file" onChange={handleFileInputChange} inputRef={inputEl} sx={{ display: 'none' }} />
                <MuiIconButton onClick={handleImportButtonClick} sx={{ marginLeft: 'auto' }}>
                    <MuiUploadIcon />
                </MuiIconButton>
                {buttonshowColumnsSideSheet}
            </MuiToolbar>
            <MuiDrawer
                anchor="right"
                variant={shouldDisplayDrawerPermanently ? 'permanent' : 'temporary'}
                open={showColumnsSideSheet}
                onClose={() => setShowColumnsSideSheet(false)}
            >
                <ColumnsSideSheet shownColumns={shownColumns} toggle={toggleShownColumns} />
            </MuiDrawer>
            <ListView<Payment>
                records={allPayments}
                fieldsInfo={[
                    { key: 'dateStr', label: 'Дата', getDisplayValue: getPaymentDate },
                    { key: 'amount', label: 'Сума, грн', getDisplayValue: getPaymentAmount, align: 'right' },
                    { key: 'note', label: 'Призначення', getDisplayValue: getPaymentNote },
                ]}
                getRecordKey={getRecordKey}
            />
            <div style={{ height: '50px', background: '#eee' }}></div>
            <ListView<Act>
                records={allActs}
                fieldsInfo={[{ key: 'name', label: 'Назва', getDisplayValue: getActName }]}
                getRecordKey={getActRecordKey}
            />
        </Paper>
    );
};

interface ColumnsSideSheetProps {
    shownColumns: Array<PaymentFieldsFromCsv>;
    toggle: (column: PaymentFieldsFromCsv) => void;
}

const ColumnsSideSheet = ({ shownColumns, toggle }: ColumnsSideSheetProps) => {
    const items = Object.entries(CSV_FIELD_TO_PAYMENT_CSV_FIELD).map(([csvField, paymentField]) => (
        <MuiListItem key={paymentField}>
            <MuiListItemText primary={csvField} />
            <MuiSwitch edge="end" onChange={() => toggle(paymentField)} checked={shownColumns.includes(paymentField)} />
        </MuiListItem>
    ));
    return (
        <MuiBox sx={{ width: SIDE_SHEET_WIDTH, pt: 1 }} role="presentation">
            <MuiList dense subheader={<MuiListSubheader>Показувати колонки</MuiListSubheader>}>
                {items}
            </MuiList>
        </MuiBox>
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

function getActRecordKey(act: Act): React.Key {
    return act.gdId;
}

function getActName(act: Act): string {
    return act.name;
}
