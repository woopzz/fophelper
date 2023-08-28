import { Outlet } from 'react-router-dom';

import MUICssBaseline from '@mui/material/CssBaseline';
import MUIBox from '@mui/material/Box';
import MUIContainer from '@mui/material/Container';

import { Notification } from './Notification';
import { Sidebar } from './Sidebar';
import { ActionButtons } from './ActionButtons';
import { SidebarVisibilityProvider } from '../hooks/useSidebarVisibility';

export const Layout = () => {
    return (
        <>
            <MUICssBaseline />
            <SidebarVisibilityProvider>
                <Sidebar />
                <MUIBox>
                    <MUIContainer sx={{ my: 1 }} maxWidth="lg">
                        <ActionButtons />
                    </MUIContainer>
                    <MUIContainer sx={{ my: 1 }} maxWidth="lg">
                        <Outlet />
                    </MUIContainer>
                </MUIBox>
            </SidebarVisibilityProvider>
            <Notification />
        </>
    );
};
