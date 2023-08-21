import { useCallback } from 'react';

import Container from '@mui/material/Container';
import Button from '@mui/material/Button';

import { CLIENT_ID, SCOPE_DRIVE_FILE } from '../data';
import { useAppDispatch, useAppSelector } from '../hooks/store';
import useGapi from '../hooks/useGapi';
import syncGD from '../thunks/syncGD';
import { BankStatementList } from '../components/BankStatementList';

const tokenClientConfig = {
    client_id: CLIENT_ID,
    scope: SCOPE_DRIVE_FILE,
};

export const BankStatementPage = () => {
    const dispatch = useAppDispatch();
    const syncStatus = useAppSelector((state) => state.gapi.syncStatus);
    const tokenClientCallback = useCallback(() => dispatch(syncGD()), [dispatch]);
    const tokenClient = useGapi({ tokenClientConfig, callback: tokenClientCallback });

    const onSync = () => tokenClient?.requestAccessToken();

    return (
        <Container maxWidth="lg">
            <Button variant="text" onClick={onSync}>
                Sync ({syncStatus})
            </Button>
            <BankStatementList />
        </Container>
    );
};
