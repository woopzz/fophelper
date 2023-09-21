import MUIDrawer from '@mui/material/Drawer';
import MUIList from '@mui/material/List';
import MUIListItem from '@mui/material/ListItem';
import MUIListItemButton from '@mui/material/ListItemButton';
import MUIListItemIcon from '@mui/material/ListItemIcon';
import MUIListItemText from '@mui/material/ListItemText';
import MUIDivider from '@mui/material/Divider';
import MUIAccountBalanceIcon from '@mui/icons-material/AccountBalance';
import MUIDescriptionIcon from '@mui/icons-material/Description';
import MUISyncIcon from '@mui/icons-material/Sync';
import MUILinkIcon from '@mui/icons-material/Link';

import { Link as RouterLink, useLocation } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../hooks/store';
import syncGD from '../store/slices/extraThunks/syncGD';
import { SIDEBAR_WIDTH } from '../data';
import useSidebarVisibility from '../hooks/useSidebarVisibility';
import { prettifyAmount } from '../utils';

const LINKS = [
    { to: '/payments', label: 'Платежі', icon: <MUIAccountBalanceIcon /> },
    { to: '/acts', label: 'Акти', icon: <MUIDescriptionIcon /> },
    { to: '/matchings', label: 'Співставлення', icon: <MUILinkIcon /> },
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
    const location = useLocation();
    return (
        <MUIList role="navigation">
            {LINKS.map(({ label, to, icon }) => (
                <MUIListItemButton
                    aria-current={location.pathname === to ? 'page' : undefined}
                    aria-label={label}
                    component={RouterLink}
                    to={to}
                    key={to}
                >
                    <MUIListItemIcon>{icon}</MUIListItemIcon>
                    <MUIListItemText primary={label} />
                </MUIListItemButton>
            ))}
        </MUIList>
    );
};

const Sync = () => {
    const dispatch = useAppDispatch();
    const syncStatus = useAppSelector((state) => state.extstorage.syncStatus);

    const handleClick = () => dispatch(syncGD());

    return (
        <MUIList>
            <MUIListItemButton onClick={handleClick} disabled={syncStatus === 'pending'}>
                <MUIListItemIcon>
                    <MUISyncIcon />
                </MUIListItemIcon>
                <MUIListItemText primary={'Синхронізація'} />
            </MUIListItemButton>
        </MUIList>
    );
};

const Totals = () => {
    const lastFiscalPeriodInfo = useAppSelector((state) => state.payments.lastFiscalPeriodInfo);
    const averageIncome = useAppSelector((state) => state.payments.averageIncome);
    return (
        <MUIList>
            <MUIListItem aria-describedby="last-fiscal-period-total">
                <MUIListItemText
                    primary={prettifyAmount({ number: lastFiscalPeriodInfo.total })}
                    secondary={`Дохід за ${lastFiscalPeriodInfo.quarter} квартал ${lastFiscalPeriodInfo.year} року`}
                    primaryTypographyProps={{
                        component: 'em',
                        sx: { fontStyle: 'normal' },
                    }}
                    secondaryTypographyProps={{
                        id: 'last-fiscal-period-total',
                    }}
                />
            </MUIListItem>
            <MUIListItem aria-describedby="current-year-average-payment">
                <MUIListItemText
                    primary={prettifyAmount({ number: averageIncome.currentYear.total, unit: 'грн/міс.' })}
                    secondary={`Середній платіж за ${averageIncome.currentYear.year} рік`}
                    primaryTypographyProps={{
                        component: 'em',
                        sx: { fontStyle: 'normal' },
                    }}
                    secondaryTypographyProps={{
                        id: 'current-year-average-payment',
                    }}
                />
            </MUIListItem>
            <MUIListItem aria-describedby="previous-year-average-payment">
                <MUIListItemText
                    primary={prettifyAmount({ number: averageIncome.previousYear.total, unit: 'грн/міс.' })}
                    secondary={`Середній платіж за ${averageIncome.previousYear.year} рік`}
                    primaryTypographyProps={{
                        component: 'em',
                        sx: { fontStyle: 'normal' },
                    }}
                    secondaryTypographyProps={{
                        id: 'previous-year-average-payment',
                    }}
                />
            </MUIListItem>
        </MUIList>
    );
};
