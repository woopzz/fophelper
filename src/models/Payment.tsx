import { calcQuarter } from '../utils';

type Quarter = 1 | 2 | 3 | 4;

export const CSV_FIELD_TO_PAYMENT_CSV_FIELD = {
    'ЄДРПОУ': 'companyRegistry',
    'МФО': 'bankCode',
    'Рахунок': 'account',
    'Валюта': 'currency',

    'Номер документу': 'docNo',
    'Дата операції': 'dateStr',
    'МФО банку': 'agentBankCode',
    'Назва банку': 'agentBank',

    'Рахунок кореспондента': 'agentAccount',
    'ЄДРПОУ кореспондента': 'agentCompanyRegistry',
    'Кореспондент': 'agent',
    'Сума': 'amountStr',
    'Призначення платежу': 'note',
} as const;

export type CsvFields = keyof typeof CSV_FIELD_TO_PAYMENT_CSV_FIELD;
export type PaymentFieldsFromCsv = (typeof CSV_FIELD_TO_PAYMENT_CSV_FIELD)[CsvFields];

type CsvPayment = Record<PaymentFieldsFromCsv, string>;

export type Payment = CsvPayment & {
    time: number;
    year: number;
    quarter: Quarter;
    amount: number;
};

export function createPayment(values: string[]): Payment {
    const self = {} as Payment;

    const techNames = Object.values(CSV_FIELD_TO_PAYMENT_CSV_FIELD);
    for (let i = 0; i < techNames.length; i++) {
        self[techNames[i]] = values[i];
    }

    // docNo is used to indentify a payment, so it's required.
    if (!self.docNo) {
        const msg = 'Платіж без номеру!';
        alert(msg);
        throw Error(msg);
    }

    // We need a Date object to order records by date.
    const date = calcPaymentDate(self);
    self.time = date.getTime();
    self.year = date.getFullYear();

    // We order records by quarter.
    self.quarter = calcQuarter(date);

    // We add amounts, so we need the Number type to do it properly.
    self.amount = parseFloat(self.amountStr.replace(/ /g, ''));

    return self;
}

const calcPaymentDate = (payment: Payment): Date => {
    return new Date(payment.dateStr.split('.').reverse().join('-'));
};
