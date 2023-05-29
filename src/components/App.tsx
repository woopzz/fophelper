import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { BankStatementList } from './BankStatementList';

export const App = () => {
    return (
        <>
            <CssBaseline />
            <Container maxWidth="lg">
                <BankStatementList />
            </Container>
        </>
    );
};
