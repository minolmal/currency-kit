import type { CurrencyConfig } from "../types/currency";
export declare class Currency {
    private static instance;
    private readonly currenciesByCode;
    private constructor();
    static getInstance(): Currency;
    static register(currency: CurrencyConfig | CurrencyConfig[]): CurrencyConfig | CurrencyConfig[];
    private registerCurrency;
    static unregister(currency: CurrencyConfig | CurrencyConfig[]): void;
    private unregisterCurrency;
    static get currencies(): CurrencyConfig[];
    static getCurrency(code: string): CurrencyConfig | undefined;
    static readonly USD: CurrencyConfig | undefined;
    static readonly EUR: CurrencyConfig | undefined;
    static readonly GBP: CurrencyConfig | undefined;
    static readonly LKR: CurrencyConfig | undefined;
    static initialize(currencies?: CurrencyConfig[]): void;
    private initializeCurrencies;
    private validateCurrencyConfig;
}
