import { useCallback } from 'react';

import MUIDrawer from '@mui/material/Drawer';
import MUIList from '@mui/material/List';
import MUIListItemButton from '@mui/material/ListItemButton';
import MUIListItemIcon from '@mui/material/ListItemIcon';
import MUIListItemText from '@mui/material/ListItemText';
import MUIDivider from '@mui/material/Divider';
import MUIBox from '@mui/material/Box';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import DescriptionIcon from '@mui/icons-material/Description';
import SyncIcon from '@mui/icons-material/Sync';

import { Link as RouterLink } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../hooks/store';
import syncGD from '../thunks/syncGD';
import useGapi from '../hooks/useGapi';
import { SIDEBAR_WIDTH, TOKEN_CLIENT_CONFIG } from '../data';
import useSidebarVisibility from '../hooks/useSidebarVisibility';

const LINKS = [
    { to: '/payments', label: 'Payments', icon: <AccountBalanceIcon /> },
    { to: '/acts', label: 'Acts', icon: <DescriptionIcon /> },
];

export const Sidebar = () => {
    const { showSidebar, permanent, setShowSidebar } = useSidebarVisibility();

    const handleClose = () => setShowSidebar(false);

    return (
        <MUIDrawer
            anchor="left"
            variant={permanent ? 'permanent' : 'temporary'}
            open={showSidebar}
            onClose={handleClose}
            sx={{
                'width': SIDEBAR_WIDTH,
                '& .MuiDrawer-paper': {
                    width: SIDEBAR_WIDTH,
                },
            }}
        >
            <Links />
            <MUIDivider />
            <Sync />
            <MUIDivider />
            <Totals />
        </MUIDrawer>
    );
};

const Links = () => {
    return (
        <MUIList>
            {LINKS.map(({ label, to, icon }) => (
                <MUIListItemButton component={RouterLink} to={to} key={to}>
                    <MUIListItemIcon>{icon}</MUIListItemIcon>
                    <MUIListItemText primary={label} />
                </MUIListItemButton>
            ))}
        </MUIList>
    );
};

const Sync = () => {
    const dispatch = useAppDispatch();
    const syncStatus = useAppSelector((state) => state.gapi.syncStatus);
    const tokenClientCallback = useCallback(() => dispatch(syncGD()), [dispatch]);
    const tokenClient = useGapi({ tokenClientConfig: TOKEN_CLIENT_CONFIG, callback: tokenClientCallback });

    const handleClick = () => tokenClient?.requestAccessToken();

    return (
        <MUIList>
            <MUIListItemButton onClick={handleClick} disabled={syncStatus === 'pending'}>
                <MUIListItemIcon>
                    <SyncIcon />
                </MUIListItemIcon>
                <MUIListItemText primary={'Sync'} />
            </MUIListItemButton>
        </MUIList>
    );
};

const Totals = () => {
    const { year, quarter, total } = useAppSelector((state) => state.payments.lastFiscalPeriodInfo);
    const averageIncome = useAppSelector((state) => state.payments.averageIncome);
    return (
        <MUIBox
            sx={{
                px: 2,
                py: 2,
            }}
        >
            <MUIBox>
                {year} / {quarter}: {total.toFixed(2)}
            </MUIBox>
            <MUIBox>
                {averageIncome.currentYear.year}: {averageIncome.currentYear.total.toFixed(2)}
            </MUIBox>
            <MUIBox>
                {averageIncome.previousYear.year}: {averageIncome.previousYear.total.toFixed(2)}
            </MUIBox>
        </MUIBox>
    );
};
