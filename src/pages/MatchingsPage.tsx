import { useSelector } from 'react-redux';

import MUIPaper from '@mui/material/Paper';
import MUITable from '@mui/material/Table';
import MUITableContainer from '@mui/material/TableContainer';
import MUITableBody from '@mui/material/TableBody';
import MUITableHead from '@mui/material/TableHead';
import MUITableRow from '@mui/material/TableRow';
import MUITableCell from '@mui/material/TableCell';

import { ActionButtons } from '../components/ActionButtons';
import { useAppSelector } from '../hooks/store';
import { selectPaymentById } from '../slices/payments';
import { type Matching } from '../models/Matching';
import { selectAllMatchings } from '../slices/matchings';
import { selectActById } from '../slices/acts';

export const MatchingsPage = () => {
    return (
        <MUIPaper>
            <ActionButtons />
            <MatchingsTable />
        </MUIPaper>
    );
};

const MatchingsTable = () => {
    const allMatchings = useSelector(selectAllMatchings);
    return (
        <MUITableContainer>
            <MUITable>
                <MUITableHead>
                    <MUITableRow>
                        <MUITableCell>Номер платежу</MUITableCell>
                        <MUITableCell>Назва акту</MUITableCell>
                    </MUITableRow>
                </MUITableHead>
                <MUITableBody>
                    {allMatchings.map((matching) => (
                        <MatchingsTableRow key={matching.paymentId} matching={matching} />
                    ))}
                </MUITableBody>
            </MUITable>
        </MUITableContainer>
    );
};

interface MatchingsTableRowProps {
    matching: Matching;
}

const MatchingsTableRow = ({ matching }: MatchingsTableRowProps) => {
    const payment = useAppSelector((state) => selectPaymentById(state, matching.paymentId));
    const act = useAppSelector((state) => selectActById(state, matching.actId));

    if (!payment || !act) {
        console.error('selectById returned undefined.');
        throw new Error();
    }

    return (
        <MUITableRow>
            <MUITableCell>{payment.docNo}</MUITableCell>
            <MUITableCell>{act.name}</MUITableCell>
        </MUITableRow>
    );
};
