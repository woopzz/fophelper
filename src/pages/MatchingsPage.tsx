import { useState, type SyntheticEvent } from 'react';

import { useSelector } from 'react-redux';
import type { EntityId } from '@reduxjs/toolkit';

import MUIBox from '@mui/material/Box';
import MUIPaper from '@mui/material/Paper';
import MUITable from '@mui/material/Table';
import MUITableContainer from '@mui/material/TableContainer';
import MUITableBody from '@mui/material/TableBody';
import MUITableHead from '@mui/material/TableHead';
import MUITableRow from '@mui/material/TableRow';
import MUITableCell from '@mui/material/TableCell';
import MUIButton from '@mui/material/Button';
import MUIIconButton from '@mui/material/IconButton';
import MUIDialog from '@mui/material/Dialog';
import MUIDialogTitle from '@mui/material/DialogTitle';
import MUIDialogContent from '@mui/material/DialogContent';
import MUIDialogActions from '@mui/material/DialogActions';
import MUIOutlinedInput from '@mui/material/OutlinedInput';
import MUIFormControl from '@mui/material/FormControl';
import MUIInputLabel from '@mui/material/InputLabel';
import MUISelect, { type SelectChangeEvent } from '@mui/material/Select';
import MUIMenuItem from '@mui/material/MenuItem';
import MUIAddIcon from '@mui/icons-material/Add';
import MUILinkOffIcon from '@mui/icons-material/LinkOff';

import { ActionButtons } from '../components/ActionButtons';
import { useAppDispatch, useAppSelector } from '../hooks/store';
import { type Matching } from '../models/Matching';
import { appendMatchings, removeMatching, selectAllMatchings } from '../slices/matchings';
import { selectPaymentById } from '../slices/payments';
import { selectActById, selectAllActs } from '../slices/acts';
import { selectUnmatchedPayments } from '../slices/extraSelectors/selectUnmatchedPayments';

export const MatchingsPage = () => {
    return (
        <MUIPaper>
            <ActionButtons buttons={<NewActionButton />} />
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

const NewActionButton = () => {
    const [open, setOpen] = useState(false);
    const [paymentId, setPaymentId] = useState<EntityId | ''>('');
    const [actId, setActId] = useState<EntityId | ''>('');

    const dispatch = useAppDispatch();
    const unmatchedPayments = useAppSelector(selectUnmatchedPayments);
    const allActs = useAppSelector(selectAllActs);

    const handleClickOpen = () => {
        setPaymentId('');
        setActId('');
        setOpen(true);
    };

    const handleClose = (event: SyntheticEvent<unknown>, reason?: string) => {
        if (reason !== 'backdropClick') {
            setOpen(false);
        }
    };

    const handleSelectPayment = (event: SelectChangeEvent<EntityId>) => {
        setPaymentId(event.target.value);
    };

    const handleSelectAct = (event: SelectChangeEvent<EntityId>) => {
        setActId(event.target.value);
    };

    const handleCreate = () => {
        if (paymentId && actId) {
            dispatch(appendMatchings([{ paymentId, actId }]));
            setPaymentId('');
            setActId('');
            setOpen(false);
        }
    };

    return (
        <>
            <MUIButton variant="outlined" startIcon={<MUIAddIcon />} onClick={handleClickOpen}>
                Створити
            </MUIButton>
            <MUIDialog open={open} onClose={handleClose}>
                <MUIDialogTitle>Нове співставлення</MUIDialogTitle>
                <MUIDialogContent sx={{ px: 3, py: 1 }}>
                    <MUIBox sx={{ display: 'flex', flexWrap: 'wrap' }}>
                        <MUIFormControl required sx={{ m: 1, width: { xs: 1, sm: 200 } }}>
                            <MUIInputLabel id="matching-select-payment">Платіж</MUIInputLabel>
                            <MUISelect
                                labelId="matching-select-payment"
                                value={paymentId}
                                onChange={handleSelectPayment}
                                input={<MUIOutlinedInput label="Платіж" />}
                            >
                                <MUIMenuItem value="">Не вибрано</MUIMenuItem>
                                {unmatchedPayments.map((payment) => (
                                    <MUIMenuItem key={payment.docNo} value={payment.docNo}>
                                        {`${payment.docNo} (${payment.amountStr} за ${payment.dateStr})`}
                                    </MUIMenuItem>
                                ))}
                            </MUISelect>
                        </MUIFormControl>
                        <MUIFormControl required sx={{ m: 1, width: { xs: 1, sm: 200 } }}>
                            <MUIInputLabel id="matching-select-act">Акт</MUIInputLabel>
                            <MUISelect
                                labelId="matching-select-act"
                                value={actId}
                                onChange={handleSelectAct}
                                input={<MUIOutlinedInput label="Акт" />}
                            >
                                <MUIMenuItem value="">Не вибрано</MUIMenuItem>
                                {allActs.map((act) => (
                                    <MUIMenuItem key={act.gdId} value={act.gdId}>
                                        {act.name}
                                    </MUIMenuItem>
                                ))}
                            </MUISelect>
                        </MUIFormControl>
                    </MUIBox>
                </MUIDialogContent>
                <MUIDialogActions sx={{ px: 3, py: 2 }}>
                    <MUIButton onClick={handleClose}>Відмінити</MUIButton>
                    <MUIButton variant="contained" disabled={!paymentId || !actId} onClick={handleCreate}>
                        Створити
                    </MUIButton>
                </MUIDialogActions>
            </MUIDialog>
        </>
    );
};
