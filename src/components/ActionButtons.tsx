import { useState, type SyntheticEvent, useRef, type ChangeEventHandler, type MouseEventHandler } from 'react';

import { useLocation } from 'react-router-dom';

import MUIBox from '@mui/material/Box';
import MUIPaper from '@mui/material/Paper';
import MUIButton from '@mui/material/Button';
import MuiTableRowsIcon from '@mui/icons-material/TableRows';
import MUIDialog from '@mui/material/Dialog';
import MUIDialogTitle from '@mui/material/DialogTitle';
import MUIDialogContent from '@mui/material/DialogContent';
import MUIDialogActions from '@mui/material/DialogActions';
import MUIOutlinedInput from '@mui/material/OutlinedInput';
import MUIFormControl from '@mui/material/FormControl';
import MUIInputLabel from '@mui/material/InputLabel';
import MUISelect, { type SelectChangeEvent } from '@mui/material/Select';
import MUIInput from '@mui/material/Input';
import MUIMenuItem from '@mui/material/MenuItem';
import MUIAddIcon from '@mui/icons-material/Add';
import MUIUploadIcon from '@mui/icons-material/Upload';

import useSidebarVisibility from '../hooks/useSidebarVisibility';
import { useAppDispatch, useAppSelector } from '../hooks/store';
import type { EntityId } from '@reduxjs/toolkit';
import { selectUnmatchedPayments } from '../store/slices/extraSelectors/selectUnmatchedPayments';
import { selectAllActs } from '../store/slices/acts';
import { addMatchings } from '../store/slices/matchings';
import { loadPaymentsFromFile } from '../services/payment_csv';
import { addPayments } from '../store/slices/payments';

export const ActionButtons = () => {
    const { permanent, setShowSidebar } = useSidebarVisibility();
    const { pathname } = useLocation();

    const buttons = [];

    if (!permanent) {
        buttons.push(<MenuButton key="home" onClick={() => setShowSidebar(true)} />);
    }

    switch (pathname) {
        case '/payments':
            buttons.push(<UploadPaymentsButton key="uploadPayments" />);
            break;
        case '/matchings':
            buttons.push(<NewMatchingButton key="newMatching" />);
            break;
    }

    if (buttons.length < 1) {
        return null;
    }

    return (
        <MUIPaper
            sx={{
                p: 2,
                gap: 1,
                display: 'flex',
                flexDirection: {
                    xs: 'column',
                    sm: 'row',
                },
                alignItems: 'start',
            }}
        >
            {buttons}
        </MUIPaper>
    );
};

const MenuButton = ({ onClick }: { onClick: MouseEventHandler }) => {
    return (
        <MUIButton variant="contained" startIcon={<MuiTableRowsIcon />} onClick={onClick}>
            Меню
        </MUIButton>
    );
};

const UploadPaymentsButton = () => {
    const dispatch = useAppDispatch();

    const inputEl = useRef<HTMLInputElement>(null);

    const handleImportButtonClick = () => inputEl.current?.click();

    const handleFileInputChange: ChangeEventHandler<HTMLInputElement> = async (ev) => {
        const files = ev.target.files;
        if (files !== null && files.length > 0) {
            const newPayments = await loadPaymentsFromFile(files[0]);
            dispatch(addPayments(newPayments));
        }
    };

    return (
        <>
            <MUIInput type="file" onChange={handleFileInputChange} inputRef={inputEl} sx={{ display: 'none' }} />
            <MUIButton variant="outlined" startIcon={<MUIUploadIcon />} onClick={handleImportButtonClick}>
                Завантажити CSV
            </MUIButton>
        </>
    );
};

const NewMatchingButton = () => {
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
            dispatch(addMatchings([{ paymentId, actId }]));
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
