import Container from '@mui/material/Container';

import { BankStatementList } from '../components/BankStatementList';

export const BankStatementPage = () => {
    return (
        <Container maxWidth="lg">
            <BankStatementList />
        </Container>
    );
};
