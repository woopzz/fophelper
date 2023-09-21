import '@testing-library/jest-dom';

import { TextEncoder } from 'util';

import { type PreloadedState } from 'redux';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import { App } from '../components/App';
import { setupStore, type RootState } from '../store';
import { type MatchingEssential } from '../store/slices/matchings';
import { type ExternalStorage } from '../store/slices/extstorage';
import { type Act } from '../models/Act';
import { type Payment } from '../models/Payment';
import type { Matching } from '../models/Matching';

// There is a locked Date.now() which is equal to 1680480000000 or
// 03.04.2023 03:00:00 GMT+3 (dd.mm.yyyy HH:MM:SS)
// See `jest.config.json`

export function getTableByAriaLabel(name: string) {
    return screen.getByRole('table', { name });
}

export function goToPage(name: string) {
    fireEvent.click(screen.getByRole('link', { name }));
}

export async function waitForAlert(message: string) {
    await screen.findByRole('alert');

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(message);
}

export function dismissAlert() {
    const alert = screen.queryByRole('alert');
    if (alert) {
        fireEvent.click(within(alert).getByRole('button', { name: 'close' }));
    }
}

export function runSync() {
    const syncButton = screen.getByRole('button', { name: 'Синхронізація' });
    fireEvent.click(syncButton);
}

export function uploadPaymentFile() {
    const uploadButton = screen.getByRole('button', { name: 'Завантажити CSV' });
    const uploadInput = uploadButton.querySelector('input[type="file"]') as Element;
    fireEvent.change(uploadInput, { target: { files: [buildFile(paymentsAsCsvString)] } });
}

// You can't just work with blobs as you want using Jest :(
function buildFile(content: string): File {
    return {
        text() {
            return Promise.resolve(content);
        },
        arrayBuffer() {
            const encoder = new TextEncoder();
            const array = encoder.encode(content);
            return Promise.resolve(array.buffer);
        },
        slice(start?: number, end?: number) {
            return buildFile(content.slice(start, end));
        },
    } as unknown as File;
}

export function renderApp({
    path = '/',
    screenWidth = 1800,
    fillStore = false,
    fillExternalStorage = false,
    respondWithFailureFromExternalStorage = false,
}: {
    path?: string;
    screenWidth?: number;
    fillStore?: boolean;
    fillExternalStorage?: boolean;
    respondWithFailureFromExternalStorage?: boolean;
} = {}) {
    const extstorage = new TestExternalStorage({ fillExternalStorage, fail: respondWithFailureFromExternalStorage });
    const store = setupStore({
        extstorage,
        preloadedState: fillStore ? preloadedState : undefined,
    });

    const rendered = render(
        <Provider store={store}>
            <MemoryRouter initialEntries={[path]}>
                <ThemeProvider theme={createTheme()}>
                    <App />
                </ThemeProvider>
            </MemoryRouter>
        </Provider>,
    );

    window.innerWidth = screenWidth;
    fireEvent(window, new Event('resize'));

    return { rendered, extstorage };
}

class TestExternalStorage implements ExternalStorage {
    private initData: {
        payments: Payment[];
        acts: Act[];
        matchings: MatchingEssential[];
    };
    private fail;
    constructor({ fillExternalStorage, fail }: { fillExternalStorage: boolean; fail: boolean }) {
        this.fail = fail;
        this.initData = {
            payments: [],
            acts: [],
            matchings: [],
        };
        if (fillExternalStorage) {
            this.initData.payments.push(payment_01_01_2023);
            this.initData.payments.push(payment_02_01_2023);
            this.initData.payments.push(payment_03_04_2023);
            this.initData.payments.push(payment_04_12_2022);
            this.initData.acts.push(act1);
            this.initData.acts.push(act2);
            this.initData.matchings.push(matching);
        }
    }
    getAllPayments() {
        if (this.fail) return Promise.reject('40x');
        return Promise.resolve(this.initData.payments);
    }
    getAllActs() {
        if (this.fail) return Promise.reject('40x');
        return Promise.resolve(this.initData.acts);
    }
    getAllMatchings() {
        if (this.fail) return Promise.reject('40x');
        return Promise.resolve(this.initData.matchings);
    }
    setPayments(payments: Payment[]) {
        if (this.fail) return Promise.reject('40x');
        this.initData.payments = payments;
        return Promise.resolve();
    }
    setMatchings(matchings: MatchingEssential[]) {
        if (this.fail) return Promise.reject('40x');
        this.initData.matchings = matchings;
        return Promise.resolve();
    }

    // the following methods are only for testing purposes
    emulateUserAddedNewAct(act: Act) {
        this.initData.acts.push(act);
    }
}

export const payment_01_01_2023: Payment = {
    docNo: '1',
    dateStr: `01.01.2023`,
    quarter: 1,
    year: 2023,
    time: 1672531200000,
    amountStr: '10 000.00',
    amount: 10000.0,
    note: '10 000.00 UAH was paid on 01.01.2023',
    companyRegistry: '12345',
    bankCode: '1',
    account: 'UA1234567890',
    currency: 'UAH',
    agentBankCode: '2',
    agentBank: 'АТ КБ "ПРИВАТБАНК"',
    agentAccount: 'UA0987654321',
    agentCompanyRegistry: '54321',
    agent: 'Partner Company',
};
export const payment_02_01_2023: Payment = {
    docNo: '2',
    dateStr: `02.01.2023`,
    quarter: 1,
    year: 2023,
    time: 1672617600000,
    amountStr: '12 500.50',
    amount: 12500.5,
    note: '12 500.50 UAH was paid on 02.01.2023',
    companyRegistry: '12345',
    bankCode: '1',
    account: 'UA1234567890',
    currency: 'UAH',
    agentBankCode: '2',
    agentBank: 'АТ КБ "ПРИВАТБАНК"',
    agentAccount: 'UA0987654321',
    agentCompanyRegistry: '54321',
    agent: 'Partner Company',
};
export const payment_03_04_2023: Payment = {
    docNo: '3',
    dateStr: `03.04.2023`,
    quarter: 2,
    year: 2023,
    time: 1680480000000,
    amountStr: '15 000.50',
    amount: 15000.5,
    note: '15 000.50 UAH was paid on 03.04.2023',
    companyRegistry: '12345',
    bankCode: '1',
    account: 'UA1234567890',
    currency: 'UAH',
    agentBankCode: '2',
    agentBank: 'АТ КБ "ПРИВАТБАНК"',
    agentAccount: 'UA0987654321',
    agentCompanyRegistry: '54321',
    agent: 'Partner Company',
};
export const payment_04_12_2022: Payment = {
    docNo: '4',
    dateStr: `04.12.2022`,
    quarter: 4,
    year: 2022,
    time: 1670112000000,
    amountStr: '17 300.00',
    amount: 17300.0,
    note: '17 300.00 UAH was paid on 04.12.2022',
    companyRegistry: '12345',
    bankCode: '1',
    account: 'UA1234567890',
    currency: 'UAH',
    agentBankCode: '2',
    agentBank: 'АТ КБ "ПРИВАТБАНК"',
    agentAccount: 'UA0987654321',
    agentCompanyRegistry: '54321',
    agent: 'Partner Company',
};
export const act1: Act = {
    gdId: 'act-1',
    name: 'Акт1.pdf',
    gdWebViewLink: '#act1',
};
export const act2: Act = {
    gdId: 'act-2',
    name: 'Акт2.pdf',
    gdWebViewLink: '#act2',
};
export const matching: Matching = {
    id: `${payment_03_04_2023.docNo}-${act1.gdId}`,
    actId: act1.gdId,
    paymentId: payment_03_04_2023.docNo,
    active: true,
};

const preloadedState: PreloadedState<RootState> = {
    payments: {
        ids: [payment_01_01_2023.docNo, payment_02_01_2023.docNo, payment_03_04_2023.docNo, payment_04_12_2022.docNo],
        entities: {
            [payment_01_01_2023.docNo]: payment_01_01_2023,
            [payment_02_01_2023.docNo]: payment_02_01_2023,
            [payment_03_04_2023.docNo]: payment_03_04_2023,
            [payment_04_12_2022.docNo]: payment_04_12_2022,
        },
        averageIncome: {
            currentYear: {
                year: 2023,
                total: 0.0,
            },
            previousYear: {
                year: 2022,
                total: 0.0,
            },
        },
        lastFiscalPeriodInfo: {
            year: 2023,
            quarter: 1,
            total: payment_01_01_2023.amount + payment_02_01_2023.amount,
        },
    },
    acts: {
        ids: [act1.gdId, act2.gdId],
        entities: {
            [act1.gdId]: act1,
            [act2.gdId]: act2,
        },
    },
    matchings: {
        ids: [matching.id],
        entities: {
            [matching.id]: matching,
        },
    },
};

export const paymentsAsCsvString = `ЄДРПОУ;МФО;Рахунок;Валюта;Номер документу;Дата операції;МФО банку;Назва банку;Рахунок кореспондента;ЄДРПОУ кореспондента;Кореспондент;Сума;Призначення платежу
12345;1;UA1234567890;UAH;1;01.01.2023;2;АТ КБ "ПРИВАТБАНК";UA0987654321;54321;Partner Company;10 000.00;10 000.00 UAH was paid on 01.01.2023
12345;1;UA1234567890;UAH;5;05.05.2023;2;АТ КБ "ПРИВАТБАНК";UA0987654321;54321;Partner Company;20 000.00;20 000.00 UAH was paid on 05.05.2023
`;
