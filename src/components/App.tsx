import { CssBaseline } from '@mui/material';
import Button from '@mui/material/Button';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

export const App = () => {
    return (
        <>
            <CssBaseline />
            <Button variant="contained">Hello World</Button>
        </>
    );
};
