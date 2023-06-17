import { useContext, useEffect, ReactNode, createContext, useMemo, useState } from 'react';
import { useErrorBoundary } from 'react-error-boundary';
import CustomError from '../models/CustomError';

const ERROR_GAPI_CLIENT = 'Помилка налаштування Google API сервісу. Без нього неможливо продовжувати роботу.';
const ERROR_ACCESS_TOKEN = 'Помилка в процесі отримання токену доступу до Google Drive.';

type TokenClientConfig = google.accounts.oauth2.TokenClientConfig;
type PublicTokenClientConfig = Omit<TokenClientConfig, 'callback' | 'error_callback'>;

interface GapiContext {
    inited: boolean;
}

const initialState: GapiContext = {
    inited: false,
};

const GapiContext = createContext<GapiContext>(initialState);

interface UseGapiProps {
    tokenClientConfig: PublicTokenClientConfig;
    callback: () => void;
}

const useGapi = ({ tokenClientConfig, callback: userCallback }: UseGapiProps) => {
    const { inited } = useContext(GapiContext);
    const [tokenClient, setTokenClient] = useState<google.accounts.oauth2.TokenClient | null>(null);
    const { showBoundary } = useErrorBoundary<CustomError>();

    useMemo(() => {
        if (!inited) {
            setTokenClient(null);
            return;
        }
        const configCallback: TokenClientConfig['callback'] = (tokenResponse) => {
            const accessToken = tokenResponse && tokenResponse.access_token;
            if (!accessToken) {
                showBoundary(new CustomError(ERROR_ACCESS_TOKEN));
                return;
            }
            userCallback();
        };
        const configErrorCallback: TokenClientConfig['error_callback'] = (error) => {
            showBoundary(new CustomError(error.message));
        };
        const config = Object.assign({}, tokenClientConfig, {
            callback: configCallback,
            errorCallback: configErrorCallback,
        });
        setTokenClient(google.accounts.oauth2.initTokenClient(config));
    }, [inited, tokenClientConfig, showBoundary, userCallback]);

    return tokenClient;
};

interface GapiProviderProps {
    children: ReactNode;
    clientInitOptions: GapiClientInitOptions;
}

const GapiProvider = ({ children, clientInitOptions }: GapiProviderProps) => {
    const inited = useGapiProvider({ clientInitOptions });
    return <GapiContext.Provider value={{ inited }}>{children}</GapiContext.Provider>;
};

interface UseGapiProviderProps {
    clientInitOptions: GapiClientInitOptions;
}

const useGapiProvider = ({ clientInitOptions }: UseGapiProviderProps) => {
    const [inited, setInited] = useState(initialState.inited);
    const { showBoundary } = useErrorBoundary<CustomError>();

    useEffect(() => {
        gapi.load('client', {
            callback: initClient,
            onerror: onError,
        });
        function initClient() {
            gapi.client.init(clientInitOptions).then(onFulfilled, onError);
        }
        function onFulfilled() {
            setInited(true);
        }
        function onError() {
            showBoundary(new CustomError(ERROR_GAPI_CLIENT));
        }
    }, [showBoundary, clientInitOptions]);

    return inited;
};

export { GapiProvider };
export default useGapi;
