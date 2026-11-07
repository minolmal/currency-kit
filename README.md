# currency-kit

TypeScript utilities for precise monetary arithmetic, currency formatting, and
currency configuration.

This project is published and maintained at
https://github.com/minolmal/currency-kit.git. It is **not published to the npm
registry**. It uses [`decimal.js`](https://github.com/MikeMcl/decimal.js) for
decimal arithmetic and Bun for development and validation.

## Table of contents

- [Project status](#project-status)
- [Installation](#installation)
- [Getting started](#getting-started)
- [Usage](#usage)
  - [Creating money values](#creating-money-values)
  - [Arithmetic and conversion](#arithmetic-and-conversion)
  - [Comparisons and value checks](#comparisons-and-value-checks)
  - [Allocation](#allocation)
  - [Formatting](#formatting)
  - [Serialization](#serialization)
- [Currencies](#currencies)
  - [Built-in currencies](#built-in-currencies)
  - [Registering a currency](#registering-a-currency)
- [Options and rounding](#options-and-rounding)
- [API reference](#api-reference)
- [Development commands](#development-commands)

## Project status

Use this repository directly: clone it for development or install it from
GitHub. This package is published on GitHub, not on the npm registry, and is
configured as private to prevent accidental npm publication.

## Installation

Install directly from GitHub with pnpm:

```bash
pnpm add github:minolmal/currency-kit
```

To install a specific branch, tag, or commit:

```bash
pnpm add github:minolmal/currency-kit#main
```

You can also clone the repository to develop it locally:

```bash
git clone https://github.com/minolmal/currency-kit.git
cd currency-kit
pnpm install
```

The GitHub install uses the package name `currency-kit`. Its ESM build and
export map support local workspace consumers and direct module imports.

## Getting started

In code running from a local clone, import the public API from the source
entrypoint:

```typescript
import { Currency, Money } from "./src/index.ts";

const price = new Money("19.99", "USD");
const quantity = 2;
const total = price.multiply(quantity);

console.log(total.toString()); // "$39.98"
console.log(Currency.getCurrency("USD")?.name); // "United States Dollar"
```

When using it as a GitHub or workspace dependency, import from the package name
or a supported subpath, for example `currency-kit/money` or
`currency-kit/constants/symbols`.

## Usage

### Creating money values

Pass a string or number amount and a registered currency code. Decimal strings
are recommended when exact decimal input matters.

```typescript
import { Money } from "currency-kit";

const price = new Money("1234.50", "USD");
const zero = Money.zero("EUR");
const fromValue = Money.from("42.75", "GBP");

console.log(price.value()); // "1234.5"
console.log(price.toString()); // "$1,234.50"
console.log(zero.toString()); // "€0.00"
console.log(fromValue.toString()); // "£42.75"
```

`Money` operations return new instances; they do not mutate the original value.
Invalid amounts, unknown currencies, and division by zero throw errors.

### Arithmetic and conversion

```typescript
const price = new Money("80.00", "USD");
const tax = price.multiply(0.1);
const total = price.add(tax);
const discounted = total.subtract(new Money("5.00", "USD"));

console.log(total.toString()); // "$88.00"
console.log(discounted.toString()); // "$83.00"
console.log(price.divide(2).toString()); // "$40.00"
```

Arithmetic between two `Money` values requires matching currency codes.
`multiply` and `divide` take JavaScript numbers as their factor/divisor.

For currency conversion, pass a `Money` containing the target-currency value of
one unit of the source currency:

```typescript
const usd = new Money("100.00", "USD");
const usdToEur = new Money("0.85", "EUR");
const eur = usd.convertTo(usdToEur);

console.log(eur.toString()); // "€85.00"
```

The exchange rate must be greater than zero.

### Comparisons and value checks

```typescript
const budget = new Money("100.00", "USD");
const purchase = new Money("85.50", "USD");

console.log(purchase.lessThanOrEqual(budget)); // true
console.log(purchase.compare(budget));
// { equal: false, greaterThan: false, lessThan: true }

console.log(purchase.isPositive()); // true
console.log(Money.zero("USD").isZero()); // true
console.log(new Money("-1", "USD").isNegative()); // true
```

Comparison methods require both values to use the same currency.

### Allocation

Split an amount by ratios. Remainder minor units are distributed among the
shares so the allocations add back to the original amount.

```typescript
const total = new Money("100.00", "USD");

const proportionalShares = total.allocate([2, 3, 5]);
console.log(proportionalShares.map((share) => share.toString()));
// ["$20.00", "$30.00", "$50.00"]

const equalShares = total.allocate([1, 1, 1]);
console.log(equalShares.map((share) => share.toString()));
// ["$33.34", "$33.33", "$33.33"]
```

The ratios array must not be empty.

### Formatting

```typescript
const amount = new Money("1234567.89", "USD");

console.log(amount.toString()); // "$1,234,567.89"
console.log(amount.formattedValue()); // "1,234,567.89"
console.log(amount.formattedValueWithSymbol()); // "$1,234,567.89"
console.log(amount.toLocaleString("de-DE")); // "1.234.567,89 $"
console.log(
  amount.toLocaleString("en-US", { currencyDisplay: "code" }),
); // "USD 1,234,567.89"
```

`toLocaleString` uses `Intl.NumberFormat` for fiat currencies. For currencies
registered with `isCrypto: true`, it returns the library's configured formatted
value and symbol.

Large amounts can also be abbreviated:

```typescript
const amount = new Money("1234567", "USD");

console.log(amount.abbreviatedValue()); // "1.2M"
console.log(amount.abbreviatedValue(2, true)); // "$1.23M"
```

### Serialization

`Money` provides `toJSON`, so it can be passed directly to `JSON.stringify`:

```typescript
const amount = new Money("1234.56", "USD");

console.log(JSON.stringify({ amount }));
// {"amount":{"currency":"USD","symbol":"$","decimals":2,
// "displayDecimals":2,"value":"1234.56","prettyValue":"$1,234.56"}}
```

## Currencies

### Built-in currencies

The registry starts with these configurations:

| Code | Name | Symbol | Decimals |
|------|------|--------|----------|
| USD | United States Dollar | `$` | 2 |
| EUR | Euro | `€` | 2 |
| GBP | British Pound | `£` | 2 |
| LKR | Sri Lankan Rupees | `Rs` | 2 |

Other currencies, including cryptocurrencies such as BTC, must be registered
before constructing a `Money` value with that code.

### Registering a currency

```typescript
import { Currency, Money, SYMBOL_POSITION } from "currency-kit";

Currency.register({
  name: "Bitcoin",
  code: "BTC",
  symbol: "₿",
  symbolPosition: SYMBOL_POSITION.PREFIX,
  decimalSeparator: ".",
  decimals: 8,
  minorUnits: "100000000",
  thousandsSeparator: ",",
  isCrypto: true,
});

const bitcoin = new Money("0.125", "BTC");
console.log(bitcoin.toString()); // "₿0.12500000"
```

For a batch, `Currency.register` accepts an array. The entire batch is validated
before any entries are added. Use `Currency.unregister` to remove registered
entries, and `Currency.initialize()` to reset the registry to the built-in
currencies. `Currency.initialize(configs)` replaces the registry with the
provided configurations.

`Currency.currencies` returns the registered configurations.
`Currency.getCurrency(code)` returns one configuration or `undefined`.
`Currency.USD`, `Currency.EUR`, `Currency.GBP`, and `Currency.LKR` expose the
built-in configurations.

## Options and rounding

`MoneyOptions` can override the currency defaults for an individual value:

```typescript
import { Money, ROUNDING_MODE } from "currency-kit";

const amount = new Money("100.555", "USD", {
  symbol: "US$",
  decimals: 3,
  displayDecimals: 2,
  roundingMode: ROUNDING_MODE.ROUND_HALF_UP,
});

console.log(amount.toString()); // "US$100.56"
console.log(amount.round(1).value()); // "100.6"
```

By default, `decimals` and `displayDecimals` come from the currency
configuration, and rounding uses `ROUNDING_MODE.ROUND_HALF_EVEN`. `decimals`
controls allocation precision; `displayDecimals` controls formatted output.

Available rounding modes follow the numeric modes used by decimal.js:

| Constant | Value | Behavior |
|-----------|-------|----------|
| `ROUND_UP` | 2 | Toward positive infinity |
| `ROUND_DOWN` | 1 | Toward zero |
| `ROUND_CEIL` | 2 | Toward positive infinity |
| `ROUND_FLOOR` | 3 | Toward negative infinity |
| `ROUND_HALF_UP` | 4 | Ties away from zero |
| `ROUND_HALF_DOWN` | 5 | Ties toward zero |
| `ROUND_HALF_EVEN` | 6 | Ties to even |
| `ROUND_HALF_CEIL` | 7 | Ties toward positive infinity |
| `ROUND_HALF_FLOOR` | 8 | Ties toward negative infinity |

## API reference

### `Money`

- Creation: `new Money(value, currency, options?)`, `Money.from(...)`,
  `Money.zero(currency, options?)`
- Arithmetic: `add`, `subtract`, `multiply`, `divide`, `allocate`, `round`,
  `convertTo`
- Comparison: `equals`, `greaterThan`, `lessThan`, `greaterThanOrEqual`,
  `lessThanOrEqual`, `compare`
- Value checks: `isZero`, `isPositive`, `isNegative`
- Values and formatting: `value`, `absoluteValue`, `negatedValue`,
  `formattedValue`, `formattedValueWithSymbol`, `abbreviatedValue`,
  `toLocaleString`, `toString`, `toJSON`

### `Currency`

- `register(config | configs)` and `unregister(config | configs)`
- `getCurrency(code)` and `currencies`
- `initialize(configs?)`
- Built-in properties: `USD`, `EUR`, `GBP`, `LKR`

### Types, constants, and helpers

The root entrypoint exports `CurrencyConfig`, `SymbolPosition`, `MoneyOptions`,
`MoneyComparisonResult`, `MoneyValidationResult`, and `ValidMoneyInput` types;
`ROUNDING_MODE`; `SYMBOL_POSITION` and formatting defaults; currency
configurations; error classes/messages; `isMoney`, `isCurrencyConfig`,
`isValidCurrencyCode`; and `validateMoneyInput`.

## Development commands

Run these commands from the repository root:

| Command | Purpose |
|---------|---------|
| `pnpm install` | Install dependencies |
| `bun check` | Type-check the project |
| `bun test` | Run the test suite |
| `bun run build` | Build ESM root and subpath entrypoints into `dist/` |
| `bun run lint` | Run Biome lint checks |
| `bun run format` | Format project files with Biome |

When contributing, run the type check, tests, lint, and build before submitting
changes.
