import { within, fireEvent } from '@testing-library/dom';

import {
    dismissAlert,
    getTableByAriaLabel,
    goToPage,
    matching,
    payment_01_01_2023,
    payment_02_01_2023,
    payment_03_04_2023,
    payment_04_12_2022,
    renderApp,
    runSync,
    uploadPaymentFile,
    waitForAlert,
} from './common';

describe('Sync', () => {
    test('should download all docs from an external storage', async () => {
        renderApp({ fillStore: false, fillExternalStorage: true });

        runSync();
        await waitForAlert('Синхронізація успішна');

        const paymentsTable = getTableByAriaLabel('Платежі');
        within(paymentsTable).getByRole('row', { name: 'Дата Сума, грн Призначення' });
        within(paymentsTable).getByRole('row', { name: '01.01.2023 10 000.00 10 000.00 UAH was paid on 01.01.2023' });
        within(paymentsTable).getByRole('row', { name: '02.01.2023 12 500.50 12 500.50 UAH was paid on 02.01.2023' });
        within(paymentsTable).getByRole('row', { name: '03.04.2023 15 000.50 15 000.50 UAH was paid on 03.04.2023' });
        within(paymentsTable).getByRole('row', { name: '04.12.2022 17 300.00 17 300.00 UAH was paid on 04.12.2022' });

        // The rows are actually ordered by date.
        expect(Array.from(paymentsTable.querySelectorAll('td:first-child')).map((x) => x.textContent)).toEqual([
            '03.04.2023',
            '02.01.2023',
            '01.01.2023',
            '04.12.2022',
        ]);

        goToPage('Акти');
        const actsTable = getTableByAriaLabel('Акти');
        within(actsTable).getByRole('row', { name: 'Назва' });
        within(actsTable).getByRole('row', { name: 'Акт1.pdf Посилання на Google Drive' });
        within(actsTable).getByRole('row', { name: 'Акт2.pdf Посилання на Google Drive' });

        goToPage('Співставлення');
        const matchingsTable = getTableByAriaLabel('Співставлення');
        within(matchingsTable).getByRole('row', { name: 'Номер платежу Сума платежу Дата платежу Назва акту' });
        within(matchingsTable).getByRole('row', { name: '3 15 000.50 03.04.2023 Акт1.pdf' });
    });
    test('should upload payments and matchings to an external storage', async () => {
        const { extstorage } = renderApp({ fillStore: true, fillExternalStorage: false });

        runSync();
        await waitForAlert('Синхронізація успішна');

        expect(await extstorage.getAllPayments()).toEqual([
            payment_01_01_2023,
            payment_02_01_2023,
            payment_03_04_2023,
            payment_04_12_2022,
        ]);
        expect(await extstorage.getAllMatchings()).toEqual([matching]);
    });
    test('should download a new act and upload new payment', async () => {
        const { extstorage } = renderApp({ fillStore: true, fillExternalStorage: true });

        extstorage.emulateUserAddedNewAct({
            gdId: '101',
            name: '101.pdf',
            gdWebViewLink: '#101',
        });

        runSync();
        await waitForAlert('Синхронізація успішна');
        dismissAlert();

        goToPage('Акти');
        within(getTableByAriaLabel('Акти')).getByRole('cell', { name: '101.pdf' });

        goToPage('Платежі');

        uploadPaymentFile();
        await waitForAlert('Нові платежі завантажено');
        dismissAlert();

        runSync();
        await waitForAlert('Синхронізація успішна');

        expect(await extstorage.getAllPayments()).toContainEqual({
            docNo: '5',
            dateStr: '05.05.2023',
            quarter: 2,
            year: 2023,
            time: 1683244800000,
            amountStr: '20 000.00',
            amount: 20000,
            note: '20 000.00 UAH was paid on 05.05.2023',
            companyRegistry: '12345',
            bankCode: '1',
            account: 'UA1234567890',
            currency: 'UAH',
            agentBankCode: '2',
            agentBank: 'АТ КБ "ПРИВАТБАНК"',
            agentAccount: 'UA0987654321',
            agentCompanyRegistry: '54321',
            agent: 'Partner Company',
        });
    });
    test('should delete a matching in the external store if it was delete by user', async () => {
        const { extstorage } = renderApp({ fillStore: true, fillExternalStorage: true });

        goToPage('Співставлення');
        const matchingsTable = getTableByAriaLabel('Співставлення');
        const row = within(matchingsTable).getByRole('row', { name: '3 15 000.50 03.04.2023 Акт1.pdf' });

        fireEvent.click(within(row).getByRole('button', { name: 'Видалити' }));

        runSync();
        await waitForAlert('Синхронізація успішна');
        expect(await extstorage.getAllMatchings()).toEqual([]);
    });
    test('should display an error alert if the sync failed', async () => {
        renderApp({ respondWithFailureFromExternalStorage: true });

        runSync();
        await waitForAlert('Помилка синхронізації');
    });
});
