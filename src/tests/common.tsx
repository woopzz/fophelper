import { fireEvent, render, screen } from '@testing-library/react';
import { type PreloadedState } from 'redux';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import { App } from '../components/App';
import { setupStore, type RootState } from '../store';
import { type Payment } from '../models/Payment';
import { type Act } from '../models/Act';
import { type MatchingEssential } from '../store/slices/matchings';
import { type ExternalStorage } from '../store/slices/extstorage';
import type { Matching } from '../models/Matching';

// There is a locked Date.now() which is equal to 1680480000000 or
// 03.04.2023 03:00:00 GMT+3 (dd.mm.yyyy HH:MM:SS)
// See `jest.config.json`

export function getTableByAriaLabel(name: string) {
    return screen.getByRole('table', { name });
}

export function renderApp({
    path = '/',
    screenWidth = 1800,
    fillStore = false,
    fillExternalStorage = false,
}: {
    path?: string;
    screenWidth?: number;
    fillStore?: boolean;
    fillExternalStorage?: boolean;
} = {}) {
    const store = setupStore({
        preloadedState: fillStore ? preloadedState : undefined,
        extstorage: new TestExternalStorage(fillExternalStorage),
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

    return rendered;
}

class TestExternalStorage implements ExternalStorage {
    private initData: {
        payments: Payment[];
        acts: Act[];
        matchings: MatchingEssential[];
    };
    constructor(fillExternalStorage: boolean) {
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
        }
    }
    getAllPayments() {
        return Promise.resolve(this.initData.payments);
    }
    getAllActs() {
        return Promise.resolve(this.initData.acts);
    }
    getAllMatchings() {
        return Promise.resolve(this.initData.matchings);
    }
    setPayments(payments: Payment[]) {
        this.initData.payments = payments;
        return Promise.resolve();
    }
    setMatchings(matchings: MatchingEssential[]) {
        this.initData.matchings = matchings;
        return Promise.resolve();
    }
}

const payment_01_01_2023: Payment = {
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
const payment_02_01_2023: Payment = {
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
const payment_03_04_2023: Payment = {
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
const payment_04_12_2022: Payment = {
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
const act1: Act = {
    gdId: 'act-1',
    name: 'Акт1.pdf',
    gdWebViewLink: '#act1',
};
const act2: Act = {
    gdId: 'act-2',
    name: 'Акт2.pdf',
    gdWebViewLink: '#act2',
};
const matching: Matching = {
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
