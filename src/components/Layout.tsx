import { Outlet, Link as RouteLink } from 'react-router-dom';

import MuiCssBaseline from '@mui/material/CssBaseline';
import MuiContainer from '@mui/material/Container';

import { Notification } from '../components/Notification';

export const Layout = () => {
    return (
        <>
            <MuiCssBaseline />
            <MuiContainer maxWidth="lg">
                <RouteLink to="/payments">Go to payments</RouteLink>
                <br />
                <RouteLink to="/acts">Go to acts</RouteLink>
                <Outlet />
            </MuiContainer>
            <Notification />
        </>
    );
};
