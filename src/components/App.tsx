import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { Routes, Route, Navigate } from 'react-router-dom';

import { PaymentsPage } from '../pages/PaymentsPage';
import { ActsPage } from '../pages/ActsPage';
import { Layout } from './Layout';

export const App = () => {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/payments" element={<PaymentsPage />} />
                <Route path="/acts" element={<ActsPage />} />
                <Route path="*" element={<Navigate to="/payments" replace />} />
            </Route>
        </Routes>
    );
};
