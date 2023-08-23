import { createContext } from 'react';

import { Outlet } from 'react-router-dom';

import MUICssBaseline from '@mui/material/CssBaseline';
import MUIContainer from '@mui/material/Container';
import MUIToolbar from '@mui/material/Toolbar';
import MUIButton from '@mui/material/Button';
import MuiTableRowsIcon from '@mui/icons-material/TableRows';

import { Notification } from './Notification';
import { Sidebar } from './Sidebar';
import useSidebarVisibility, { SidebarVisibilityProvider } from '../hooks/useSidebarVisibility';

const SIDEBAR_DEFAULT_VISIBILITY = false;

export const SidebarVisibilityContext = createContext({
    showSidebar: SIDEBAR_DEFAULT_VISIBILITY,
    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
    setShowSidebar: (_: boolean) => {},
});

export const Layout = () => {
    return (
        <>
            <MUICssBaseline />
            <SidebarVisibilityProvider>
                <Sidebar />
                <MUIContainer maxWidth="lg">
                    <MUIToolbar>
                        <ActionButtons />
                    </MUIToolbar>
                    <Outlet />
                </MUIContainer>
            </SidebarVisibilityProvider>
            <Notification />
        </>
    );
};

const ActionButtons = () => {
    const { permanent, setShowSidebar } = useSidebarVisibility();

    const handleClickMenu = () => setShowSidebar(true);

    return (
        <MUIButton
            variant="contained"
            startIcon={<MuiTableRowsIcon />}
            onClick={handleClickMenu}
            sx={{ display: permanent ? 'none' : 'inherit' }}
        >
            Меню
        </MUIButton>
    );
};
