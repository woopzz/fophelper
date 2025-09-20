/// <reference types="gapi" />
/// <reference types="gapi.client.drive-v3" />
/// <reference types="google.accounts" />

import '@fontsource/roboto/latin-300.css';
import '@fontsource/roboto/cyrillic-300.css';
import '@fontsource/roboto/latin-400.css';
import '@fontsource/roboto/cyrillic-400.css';
import '@fontsource/roboto/latin-500.css';
import '@fontsource/roboto/cyrillic-500.css';
import '@fontsource/roboto/latin-700.css';
import '@fontsource/roboto/cyrillic-700.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { Provider } from 'react-redux';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import { blueGrey } from '@mui/material/colors';

import Error from './components/ErrorPage';
import GoogleApi from './gateways/GoogleApi';
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
        extstorage: new GoogleApi(),
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
