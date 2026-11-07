import { EUR_CONFIG, GBP_CONFIG, LKR_CONFIG, USD_CONFIG } from "../configs";
import { CurrencyError } from "../errors";
import type { CurrencyConfig } from "../types/currency";

const DEFAULT_CURRENCIES = [USD_CONFIG, EUR_CONFIG, GBP_CONFIG, LKR_CONFIG];

export class Currency {
  private static instance: Currency | null = null;
  private readonly currenciesByCode: Map<string, CurrencyConfig>;

  private constructor() {
    this.currenciesByCode = new Map(
      DEFAULT_CURRENCIES.map((currency) => [currency.code, currency]),
    );
  }

  static getInstance(): Currency {
    if (!Currency.instance) {
      Currency.instance = new Currency();
    }

    return Currency.instance;
  }

  static register(
    currency: CurrencyConfig | CurrencyConfig[],
  ): CurrencyConfig | CurrencyConfig[] {
    return Currency.getInstance().registerCurrency(currency);
  }

  private registerCurrency(
    currency: CurrencyConfig | CurrencyConfig[],
  ): CurrencyConfig | CurrencyConfig[] {
    const currencies = Array.isArray(currency) ? currency : [currency];

    for (const curr of currencies) {
      this.validateCurrencyConfig(curr);
    }

    for (const curr of currencies) {
      this.currenciesByCode.set(curr.code, curr);
    }

    return currency;
  }

  static unregister(currency: CurrencyConfig | CurrencyConfig[]): void {
    Currency.getInstance().unregisterCurrency(currency);
  }

  private unregisterCurrency(currency: CurrencyConfig | CurrencyConfig[]): void {
    const currencies = Array.isArray(currency) ? currency : [currency];

    for (const curr of currencies) {
      this.currenciesByCode.delete(curr.code);
    }
  }

  static get currencies(): CurrencyConfig[] {
    return Array.from(Currency.getInstance().currenciesByCode.values());
  }

  static getCurrency(code: string): CurrencyConfig | undefined {
    return Currency.getInstance().currenciesByCode.get(code);
  }

  static readonly USD = Currency.getCurrency(USD_CONFIG.code);
  static readonly EUR = Currency.getCurrency(EUR_CONFIG.code);
  static readonly GBP = Currency.getCurrency(GBP_CONFIG.code);
  static readonly LKR = Currency.getCurrency(LKR_CONFIG.code);

  static initialize(currencies?: CurrencyConfig[]): void {
    Currency.getInstance().initializeCurrencies(currencies);
  }

  private initializeCurrencies(currencies?: CurrencyConfig[]): void {
    this.currenciesByCode.clear();

    if (currencies) {
      this.registerCurrency(currencies);
    } else {
      this.registerCurrency(DEFAULT_CURRENCIES);
    }
  }

  private validateCurrencyConfig(config: CurrencyConfig): void {
    if (!config.code || !config.symbol || !config.name) {
      throw new CurrencyError("Invalid currency configuration");
    }
  }
}