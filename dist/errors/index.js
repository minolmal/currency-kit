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
export {
  CurrencyError,
  ERROR_MESSAGES,
  MoneyError
};
