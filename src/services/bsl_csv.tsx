import * as csv from 'jquery-csv';
import { Payment, createPayment } from '../models/BankStatementLine';

const csvOptions: csv.TOptions = {
    separator: ';',
    delimiter: '\'', // prettier-ignore
};

export async function loadPaymentsFromFile(file: File): Promise<Payment[]> {
    const isWin1251 = await isWindows1251(file);

    let csvString: string;
    if (isWin1251) {
        csvString = await getWindows1251Content(file);
    } else {
        csvString = await file.text();
    }

    return loadPaymentsFromString(csvString);
}

export function loadPaymentsFromString(data: string): Payment[] {
    const res = csv.toArrays(data, csvOptions) as string[][];
    if (res.length < 2 || res[0][0] !== 'ЄДРПОУ') {
        return [];
    }

    return res.slice(1).map((x) => createPayment(x));
}

/**
 * It's kind of a hack, but i've not found another simple way to get file encoding.
 * You have to pass a File object and an array of bytes as numbers
 *
 * Returns a boolean value.
 */
async function isWindows1251(file: File): Promise<boolean> {
    // ЄДРПОУ
    const expected = [170, 196, 208, 207, 206, 211];

    const arrBuffer = await file.slice(0, expected.length).arrayBuffer();
    const intBuffer = new Uint8Array(arrBuffer);

    for (let i = 0; i < expected.length; i++) {
        if (intBuffer[i] !== expected[i]) return false;
    }

    return true;
}

/**
 * Returns a DOMString object obtained from the file encoded in Windows-1251.
 */
async function getWindows1251Content(file: File): Promise<string> {
    const arrBuffer = await file.arrayBuffer();
    const decoder = new TextDecoder('windows-1251');
    return decoder.decode(arrBuffer);
}
