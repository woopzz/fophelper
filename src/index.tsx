/// <reference types="gapi" />
/// <reference types="gapi.client.drive-v3" />
/// <reference types="google.accounts" />

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';

import { App } from './components/App';
import Error from './components/ErrorPage';
import { GapiProvider } from './hooks/useGapi';
import { API_KEY, DISCOVERY_DOC } from './data';

const gapiClientInitOptions = {
    apiKey: API_KEY,
    discoveryDocs: [DISCOVERY_DOC],
};

const appNode = document.getElementById('app');
if (appNode !== null) {
    const root = createRoot(appNode);
    root.render(
        <StrictMode>
            <ErrorBoundary FallbackComponent={Error}>
                <GapiProvider clientInitOptions={gapiClientInitOptions}>
                    <App />
                </GapiProvider>
            </ErrorBoundary>
        </StrictMode>,
    );
}
