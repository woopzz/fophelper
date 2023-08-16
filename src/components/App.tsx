import { useCallback } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { BankStatementList } from './BankStatementList';
import useGoogleDrive from '../hooks/useGoogleDrive';
import useGapi from '../hooks/useGapi';
import { CLIENT_ID, SCOPE_DRIVE_FILE } from '../data';

const tokenClientConfig = {
    client_id: CLIENT_ID,
    scope: SCOPE_DRIVE_FILE,
};

export const App = () => {
    const { sync } = useGoogleDrive();
    const tokenClientCallback = useCallback(() => sync(), [sync]);
    const tokenClient = useGapi({ tokenClientConfig, callback: tokenClientCallback });

    const onSync = () => tokenClient?.requestAccessToken();

    return (
        <>
            <CssBaseline />
            <Container maxWidth="lg">
                <Button variant="text" onClick={onSync}>
                    Sync
                </Button>
                <BankStatementList />
            </Container>
        </>
    );
};
