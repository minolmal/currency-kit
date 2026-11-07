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
export {
  EUR_CONFIG,
  GBP_CONFIG,
  LKR_CONFIG,
  USD_CONFIG
};
