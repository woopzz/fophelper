import { useState, useRef, ChangeEventHandler } from 'react';

import useTheme from '@mui/material/styles/useTheme';
import Input from '@mui/material/Input';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
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

const SIDE_SHEET_WIDTH = 256;

export const BankStatementList = () => {
    const theme = useTheme();
    const screenWidth = useWindowInnerWidth();

    const payments = useAppSelector((state) => state.payments.list);
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

    const headRowCells = Object.entries(CSV_FIELD_TO_PAYMENT_CSV_FIELD)
        .filter(([_, paymentField]) => shownColumns.includes(paymentField))
        .map(([csvField, paymentField]) => <TableCell key={paymentField}>{csvField}</TableCell>);

    const shouldDisplayDrawerPermanently = (screenWidth - theme.breakpoints.values.lg) / 2 > SIDE_SHEET_WIDTH;

    const buttonshowColumnsSideSheet = !shouldDisplayDrawerPermanently && (
        <MuiIconButton onClick={() => setShowColumnsSideSheet(!showColumnsSideSheet)}>
            <MuiTableRowsIcon />
        </MuiIconButton>
    );

    return (
        <Paper>
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
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>{headRowCells}</TableRow>
                    </TableHead>
                    <TableBody>
                        {payments.map((payment) => (
                            <ListItem key={payment.docNo} payment={payment} shownColumns={shownColumns} />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

interface ListItemProps {
    payment: Payment;
    shownColumns: Array<PaymentFieldsFromCsv>;
}

const ListItem = ({ payment, shownColumns }: ListItemProps) => {
    const cells = Object.values(CSV_FIELD_TO_PAYMENT_CSV_FIELD)
        .filter((paymentField) => shownColumns.includes(paymentField))
        .map((paymentField) => <TableCell key={paymentField}>{payment[paymentField]}</TableCell>);
    return <TableRow>{cells}</TableRow>;
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
