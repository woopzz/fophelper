import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import { Payment } from '../models/BankStatementLine';

interface BankStatementListProps {
    payments: Payment[];
}

export const BankStatementList = ({ payments }: BankStatementListProps) => {
    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell align="right">Дата</TableCell>
                        <TableCell>Призначення</TableCell>
                        <TableCell align="right">Сумма</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {payments.map((payment) => (
                        <ListItem key={payment.docNo} payment={payment} />
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

interface ListItemProps {
    payment: Payment;
}

const ListItem = ({ payment }: ListItemProps) => {
    return (
        <TableRow>
            <TableCell align="right">{payment.dateStr}</TableCell>
            <TableCell>{payment.note}</TableCell>
            <TableCell align="right">{payment.amount}</TableCell>
        </TableRow>
    );
};
