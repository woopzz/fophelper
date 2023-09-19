import { screen, waitFor, within } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';

import { getTableByAriaLabel, renderApp } from './common';

describe('Navigation', () => {
    test('should display the payments page at init', async () => {
        renderApp({ path: '/' });
        await checkLandingOnPaymentsPage();
    });
    test('should redirect to the payments page in case of an invalid route', async () => {
        renderApp({ path: '/not/existed' });
        await checkLandingOnPaymentsPage();
    });
    test('should change pages', async () => {
        renderApp();

        const navigation = screen.getByRole('navigation');

        userEvent.click(within(navigation).getByRole('link', { name: 'Платежі' }));
        await checkLandingOnPaymentsPage();

        userEvent.click(within(navigation).getByRole('link', { name: 'Акти' }));
        await checkLandingOnActsPage();

        userEvent.click(within(navigation).getByRole('link', { name: 'Співставлення' }));
        await checkLandingOnMatchingsPage();
    });
});

function checkLandingOnPaymentsPage() {
    return waitFor(() => {
        screen.getByRole('link', {
            name: 'Платежі',
            current: 'page',
        });
        getTableByAriaLabel('Платежі');
    });
}

function checkLandingOnActsPage() {
    return waitFor(() => {
        screen.getByRole('link', {
            name: 'Акти',
            current: 'page',
        });
        getTableByAriaLabel('Акти');
    });
}

function checkLandingOnMatchingsPage() {
    return waitFor(() => {
        screen.getByRole('link', {
            name: 'Співставлення',
            current: 'page',
        });
        getTableByAriaLabel('Співставлення');
    });
}
