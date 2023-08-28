import { useSelector } from 'react-redux';

import MUIPaper from '@mui/material/Paper';
import MUITable from '@mui/material/Table';
import MUITableContainer from '@mui/material/TableContainer';
import MUITableBody from '@mui/material/TableBody';
import MUITableHead from '@mui/material/TableHead';
import MUITableRow from '@mui/material/TableRow';
import MUITableCell from '@mui/material/TableCell';
import MUIIconButton from '@mui/material/IconButton';
import MUILinkOffIcon from '@mui/icons-material/LinkOff';

import { useAppDispatch, useAppSelector } from '../hooks/store';
import { type Matching } from '../models/Matching';
import { removeMatching, selectAllMatchings } from '../slices/matchings';
import { selectPaymentById } from '../slices/payments';
import { selectActById } from '../slices/acts';

export const MatchingsPage = () => {
    return (
        <MUIPaper>
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
                        <MUITableCell>Сума платежу</MUITableCell>
                        <MUITableCell>Дата платежу</MUITableCell>
                        <MUITableCell>Назва акту</MUITableCell>
                        <MUITableCell />
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
    const dispatch = useAppDispatch();
    const payment = useAppSelector((state) => selectPaymentById(state, matching.paymentId));
    const act = useAppSelector((state) => selectActById(state, matching.actId));

    if (!payment || !act) {
        console.error('selectById returned undefined.');
        throw new Error();
    }

    const handleUnlink = () => dispatch(removeMatching(matching.id));

    return (
        <MUITableRow>
            <MUITableCell>{payment.docNo}</MUITableCell>
            <MUITableCell>{payment.amountStr}</MUITableCell>
            <MUITableCell>{payment.dateStr}</MUITableCell>
            <MUITableCell>{act.name}</MUITableCell>
            <MUITableCell align="right">
                <MUIIconButton onClick={handleUnlink}>
                    <MUILinkOffIcon />
                </MUIIconButton>
            </MUITableCell>
        </MUITableRow>
    );
};
