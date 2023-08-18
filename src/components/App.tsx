import { useCallback } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { BankStatementList } from './BankStatementList';
import { CLIENT_ID, SCOPE_DRIVE_FILE } from '../data';
import { useAppDispatch, useAppSelector } from '../hooks/store';
import useGapi from '../hooks/useGapi';
import syncGD from '../thunks/syncGD';

const tokenClientConfig = {
    client_id: CLIENT_ID,
    scope: SCOPE_DRIVE_FILE,
};

export const App = () => {
    const dispatch = useAppDispatch();
    const syncStatus = useAppSelector((state) => state.gapi.syncStatus);
    const tokenClientCallback = useCallback(() => dispatch(syncGD()), [dispatch]);
    const tokenClient = useGapi({ tokenClientConfig, callback: tokenClientCallback });

    const onSync = () => tokenClient?.requestAccessToken();

    return (
        <>
            <CssBaseline />
            <Container maxWidth="lg">
                <Button variant="text" onClick={onSync}>
                    Sync ({syncStatus})
                </Button>
                <BankStatementList />
            </Container>
        </>
    );
};
