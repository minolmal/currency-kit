export declare class MoneyError extends Error {
    constructor(message: string);
}
export declare class CurrencyError extends Error {
    constructor(message: string);
}
export declare const ERROR_MESSAGES: {
    readonly INVALID_AMOUNT: "Invalid amount provided";
    readonly CURRENCY_MISMATCH: (current: string, other: string) => string;
    readonly CURRENCY_NOT_FOUND: (code: string) => string;
    readonly INVALID_CURRENCY_CONFIG: 'Invalid currency configuration';
    readonly EMPTY_RATIOS: 'Cannot allocate to empty ratios';
    readonly DIVISION_BY_ZERO: 'Division by zero is not allowed';
};
