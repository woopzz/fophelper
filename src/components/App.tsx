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
    const { state, sync } = useGoogleDrive();
    const tokenClientCallback = useCallback(() => sync(), [sync]);
    const tokenClient = useGapi({ tokenClientConfig, callback: tokenClientCallback });

    const onSync = () => tokenClient?.requestAccessToken();

    // const onGoogleAuthInit = useCallback(() => {}, [sync]);

    // const sync = useCallback(() => {
    //     if (!tokenClient) {
    //         return;
    //     }
    //     tokenClient.requestAccessToken();
    // }, [tokenClient]);

    // function onFulfilled() {
    //     const _tokenClient = google.accounts.oauth2.initTokenClient({
    //         client_id: CLIENT_ID,
    //         scope: SCOPE_DRIVE_FILE,
    //         callback: (tokenResponse: any) => {
    //             const accessToken = tokenResponse && tokenResponse.access_token;
    //             if (!accessToken) {
    //                 showBoundary(new CustomError(ERROR_ACCESS_TOKEN));
    //                 return;
    //             }
    //             if (!google.accounts.oauth2.hasGrantedAllScopes(tokenResponse, SCOPE_DRIVE_FILE)) {
    //                 showBoundary(new CustomError(ERROR_ACCESS_TO_SCOPE));
    //                 return;
    //             }
    //         },
    //     });
    //     setTokenClient(_tokenClient);
    // }

    // console.log('hasAccess', hasAccess);
    // async function start() {
    //     await gapi.client.init({
    //         apiKey: API_KEY,
    //         discoveryDocs: [DISCOVERY_DOC],
    //     });

    //     const tokenClient = google.accounts.oauth2.initTokenClient({
    //         client_id: CLIENT_ID,
    //         scope: SCOPE,
    //         callback: async (resp: any) => {
    //             if (resp.error !== undefined) {
    //                 throw resp;
    //             }
    //             await listFiles();
    //         },
    //     });

    //     if (gapi.client.getToken() === null) {
    //         // Prompt the user to select a Google Account and ask for consent to share their data
    //         // when establishing a new session.
    //         tokenClient.requestAccessToken({ prompt: 'consent' });
    //     } else {
    //         // Skip display of account chooser and consent dialog for an existing session.
    //         tokenClient.requestAccessToken({ prompt: '' });
    //     }
    // }

    // async function listFiles() {
    //     try {
    //         const response = await gapi.client.drive.files.list({
    //             pageSize: 10,
    //             fields: 'files(id, name)',
    //         });
    //         console.log('response:', response);
    //     } catch (err) {
    //         console.error('err:', err);
    //     }
    // }

    // useEffect(() => {
    //     gapi.load('client', start);
    // }, []);

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
