/// <reference types="gapi" />
/// <reference types="gapi.client.drive-v3" />
/// <reference types="google.accounts" />

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { Provider } from 'react-redux';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import { blueGrey } from '@mui/material/colors';

import Error from './components/ErrorPage';
import Gapi from './gateways/GoogleApi';
import { App } from './components/App';
import { setupStore } from './store';

const theme = createTheme({
    palette: {
        background: {
            default: blueGrey[50],
        },
    },
    components: {
        MuiButton: {
            defaultProps: {
                size: 'small',
                disableElevation: true,
            },
        },
    },
});

const appNode = document.getElementById('app');
if (appNode !== null) {
    const root = createRoot(appNode);
    const store = setupStore({
        googleApi: new Gapi(),
    });
    root.render(
        <StrictMode>
            <ErrorBoundary FallbackComponent={Error}>
                <Provider store={store}>
                    <HashRouter>
                        <ThemeProvider theme={theme}>
                            <App />
                        </ThemeProvider>
                    </HashRouter>
                </Provider>
            </ErrorBoundary>
        </StrictMode>,
    );
}
