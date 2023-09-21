import { screen } from '@testing-library/dom';

import { renderApp, runSync, uploadPaymentFile, waitForAlert } from './common';

describe('Totals', () => {
    test('should display zeros when the store is empty', () => {
        renderApp({ fillStore: false });
        checkLastFiscalPeriodTotal('0.00');
        checkCurrentYearAveragePayment('0.00');
        checkPreviousYearAveragePayment('0.00');
    });
    test('should be updated after the sync', async () => {
        renderApp({ fillStore: false, fillExternalStorage: true });

        runSync();
        await waitForAlert('Синхронізація успішна');

        checkLastFiscalPeriodTotal('22 500.50');
        checkCurrentYearAveragePayment('18 750.50');
        checkPreviousYearAveragePayment('17 300.00');
    });
    test('should be updated after new payments are loaded', async () => {
        renderApp({ fillStore: false });

        uploadPaymentFile();
        await waitForAlert('Нові платежі завантажено');

        checkLastFiscalPeriodTotal('10 000.00');
        checkCurrentYearAveragePayment('15 000.00');
        checkPreviousYearAveragePayment('0.00');
    });
});

function checkLastFiscalPeriodTotal(amount: string) {
    return check('Дохід за 1 квартал 2023 року', amount + ' грн');
}

function checkCurrentYearAveragePayment(amount: string) {
    return check('Середній платіж за 2023 рік', amount + ' грн/міс.');
}

function checkPreviousYearAveragePayment(amount: string) {
    return check('Середній платіж за 2022 рік', amount + ' грн/міс.');
}

function check(description: string, expectedText: string) {
    const listItem = screen.getByRole('listitem', { description });
    const text = listItem.querySelector('em')?.textContent;
    expect(text).toEqual(expectedText);
}
