import { type FallbackProps } from 'react-error-boundary';

import CustomError from '../models/CustomError';

const ErrorPage = ({ error }: FallbackProps) => {
    let message: string | null = null;
    if (error instanceof CustomError) {
        message = error.message;
    }
    return (
        <div>
            <p>Додаток тимчасово не працює. Вибачте за незручності {':('}</p>
            {message && <p>{message}</p>}
        </div>
    );
};

export default ErrorPage;
