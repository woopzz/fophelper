import { Outlet } from 'react-router-dom';

import MUICssBaseline from '@mui/material/CssBaseline';
import MUIContainer from '@mui/material/Container';

import { Notification } from './Notification';
import { Sidebar } from './Sidebar';
import { SidebarVisibilityProvider } from '../hooks/useSidebarVisibility';

export const Layout = () => {
    return (
        <>
            <MUICssBaseline />
            <SidebarVisibilityProvider>
                <Sidebar />
                <MUIContainer sx={{ my: 1 }} maxWidth="lg">
                    <Outlet />
                </MUIContainer>
            </SidebarVisibilityProvider>
            <Notification />
        </>
    );
};
