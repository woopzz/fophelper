export function calcQuarter(date: Date) {
    switch (date.getMonth()) {
        case 0:
        case 1:
        case 2:
            return 1;
        case 3:
        case 4:
        case 5:
            return 2;
        case 6:
        case 7:
        case 8:
            return 3;
        default:
            return 4;
        case 9:
        case 10:
        case 11:
            return 4;
    }
}

function prettifyNumber(number: number | string): string {
    const parts = number.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return parts.join('.');
}

export function prettifyAmount({ number, unit = 'грн' }: { number: number; unit?: string }): string {
    return prettifyNumber(Number(number).toFixed(2)) + ' ' + unit;
}
