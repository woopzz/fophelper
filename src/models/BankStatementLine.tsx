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

type CsvFields = keyof typeof CSV_FIELD_TO_PAYMENT_CSV_FIELD;
type PaymentFieldsFromCsv = (typeof CSV_FIELD_TO_PAYMENT_CSV_FIELD)[CsvFields];

type CsvPayment = Record<PaymentFieldsFromCsv, string>;

export type Payment = CsvPayment & {
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
        const msg = 'A payment does not have a number!';
        alert(msg);
        throw Error(msg);
    }

    // We need a Date object to order records by date.
    const date = calcPaymentDate(self);
    self.year = date.getFullYear();

    // We order records by quarter.
    switch (date.getMonth()) {
        case 0:
        case 1:
        case 2:
            self.quarter = 1;
            break;
        case 3:
        case 4:
        case 5:
            self.quarter = 2;
            break;
        case 6:
        case 7:
        case 8:
            self.quarter = 3;
            break;
        case 9:
        case 10:
        case 11:
            self.quarter = 4;
            break;
    }

    // We add amounts, so we need the Number type to do it properly.
    self.amount = parseFloat(self.amountStr.replace(/ /g, ''));

    return self;
}

export const sortPaymentsByDate = (payments: Payment[], { reverse = false }) => {
    const coef = reverse ? -1 : 1;
    return payments.sort((a, b) => coef * (calcPaymentDate(a).getTime() - calcPaymentDate(b).getTime()));
};

const calcPaymentDate = (payment: Payment): Date => {
    return new Date(payment.dateStr.split('.').reverse().join('-'));
};
