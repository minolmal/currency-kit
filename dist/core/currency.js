var __defProp = Object.defineProperty;
var __returnValue = (v) => v;
function __exportSetter(name, newValue) {
  this[name] = __returnValue.bind(null, newValue);
}
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: __exportSetter.bind(all, name)
    });
};

// src/configs/index.ts
var exports_configs = {};
__export(exports_configs, {
  EUR_CONFIG: () => EUR_CONFIG,
  GBP_CONFIG: () => GBP_CONFIG,
  LKR_CONFIG: () => LKR_CONFIG,
  USD_CONFIG: () => USD_CONFIG
});

// src/constants/symbols.ts
var DEFAULT_DECIMAL_PLACES = 2;
var DEFAULT_DECIMAL_SEPARATOR = ".";
var DEFAULT_MINOR_UNITS = "100";
var DEFAULT_THOUSANDS_SEPARATOR = ",";
var SYMBOL_POSITION = { PREFIX: "prefix", SUFFIX: "suffix" };

// src/configs/index.ts
var USD_CONFIG = {
  name: "United States Dollar",
  code: "USD",
  symbol: "$",
  symbolPosition: SYMBOL_POSITION.PREFIX,
  decimalSeparator: DEFAULT_DECIMAL_SEPARATOR,
  decimals: DEFAULT_DECIMAL_PLACES,
  minorUnits: DEFAULT_MINOR_UNITS,
  thousandsSeparator: DEFAULT_THOUSANDS_SEPARATOR,
  isCrypto: false
};
var EUR_CONFIG = {
  name: "Euro",
  code: "EUR",
  symbol: "€",
  symbolPosition: SYMBOL_POSITION.PREFIX,
  decimalSeparator: DEFAULT_DECIMAL_SEPARATOR,
  decimals: DEFAULT_DECIMAL_PLACES,
  minorUnits: DEFAULT_MINOR_UNITS,
  thousandsSeparator: DEFAULT_THOUSANDS_SEPARATOR,
  isCrypto: false
};
var GBP_CONFIG = {
  name: "British Pound",
  code: "GBP",
  symbol: "£",
  symbolPosition: SYMBOL_POSITION.PREFIX,
  decimalSeparator: DEFAULT_DECIMAL_SEPARATOR,
  decimals: DEFAULT_DECIMAL_PLACES,
  minorUnits: DEFAULT_MINOR_UNITS,
  thousandsSeparator: DEFAULT_THOUSANDS_SEPARATOR,
  isCrypto: false
};
var LKR_CONFIG = {
  name: "Sri Lankan Rupees",
  code: "LKR",
  symbol: "Rs",
  symbolPosition: SYMBOL_POSITION.PREFIX,
  decimalSeparator: DEFAULT_DECIMAL_SEPARATOR,
  decimals: DEFAULT_DECIMAL_PLACES,
  minorUnits: DEFAULT_MINOR_UNITS,
  thousandsSeparator: DEFAULT_THOUSANDS_SEPARATOR,
  isCrypto: false
};

// src/errors/index.ts
class MoneyError extends Error {
  constructor(message) {
    super(message);
    this.name = "MoneyError";
  }
}

class CurrencyError extends Error {
  constructor(message) {
    super(message);
    this.name = "CurrencyError";
  }
}
var ERROR_MESSAGES = {
  INVALID_AMOUNT: "Invalid amount provided",
  CURRENCY_MISMATCH: (current, other) => `Cannot operate on different currencies (current: "${current}", other: "${other}")`,
  CURRENCY_NOT_FOUND: (code) => `Currency config for ${code} not found. Config can be registered with "Currency.register(<CurrencyConfig>)"`,
  INVALID_CURRENCY_CONFIG: "Invalid currency configuration",
  EMPTY_RATIOS: "Cannot allocate to empty ratios",
  DIVISION_BY_ZERO: "Division by zero is not allowed"
};

// src/core/currency.ts
var DEFAULT_CURRENCIES = [USD_CONFIG, EUR_CONFIG, GBP_CONFIG, LKR_CONFIG];

class Currency {
  static instance = null;
  currenciesByCode;
  constructor() {
    this.currenciesByCode = new Map(DEFAULT_CURRENCIES.map((currency) => [currency.code, currency]));
  }
  static getInstance() {
    if (!Currency.instance) {
      Currency.instance = new Currency;
    }
    return Currency.instance;
  }
  static register(currency) {
    return Currency.getInstance().registerCurrency(currency);
  }
  registerCurrency(currency) {
    const currencies = Array.isArray(currency) ? currency : [currency];
    for (const curr of currencies) {
      this.validateCurrencyConfig(curr);
    }
    for (const curr of currencies) {
      this.currenciesByCode.set(curr.code, curr);
    }
    return currency;
  }
  static unregister(currency) {
    Currency.getInstance().unregisterCurrency(currency);
  }
  unregisterCurrency(currency) {
    const currencies = Array.isArray(currency) ? currency : [currency];
    for (const curr of currencies) {
      this.currenciesByCode.delete(curr.code);
    }
  }
  static get currencies() {
    return Array.from(Currency.getInstance().currenciesByCode.values());
  }
  static getCurrency(code) {
    return Currency.getInstance().currenciesByCode.get(code);
  }
  static USD = Currency.getCurrency(USD_CONFIG.code);
  static EUR = Currency.getCurrency(EUR_CONFIG.code);
  static GBP = Currency.getCurrency(GBP_CONFIG.code);
  static LKR = Currency.getCurrency(LKR_CONFIG.code);
  static initialize(currencies) {
    Currency.getInstance().initializeCurrencies(currencies);
  }
  initializeCurrencies(currencies) {
    this.currenciesByCode.clear();
    if (currencies) {
      this.registerCurrency(currencies);
    } else {
      this.registerCurrency(DEFAULT_CURRENCIES);
    }
  }
  validateCurrencyConfig(config) {
    if (!config.code || !config.symbol || !config.name) {
      throw new CurrencyError("Invalid currency configuration");
    }
  }
}
export {
  Currency
};
