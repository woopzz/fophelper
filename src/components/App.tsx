import { Routes, Route, Navigate } from 'react-router-dom';

import { Layout } from './Layout';
import { PaymentsPage } from '../pages/PaymentsPage';
import { ActsPage } from '../pages/ActsPage';
import { MatchingsPage } from '../pages/MatchingsPage';

export const App = () => {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/payments" element={<PaymentsPage />} />
                <Route path="/acts" element={<ActsPage />} />
                <Route path="/matchings" element={<MatchingsPage />} />
                <Route path="*" element={<Navigate to="/payments" replace />} />
            </Route>
        </Routes>
    );
};
