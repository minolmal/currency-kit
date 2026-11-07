import Decimal from "decimal.js";
import { ROUNDING_MODE } from "../constants/money";
import { SYMBOL_POSITION } from "../constants/symbols";
import { ERROR_MESSAGES, MoneyError } from "../errors";
import type { CurrencyConfig } from "../types/currency";
import type {
  MoneyComparisonResult,
  MoneyObject,
  MoneyOptions,
  RoundingMode,
} from "../types/money";
import { Currency } from "./currency";

export class Money {
  private readonly amount: Decimal;
  private readonly currencyConfig: CurrencyConfig;
  private readonly symbol: string;
  private readonly decimals: number;
  private readonly displayDecimals: number;
  private readonly roundingMode: RoundingMode;

  private static readonly SCALES = [
    { value: new Decimal("1000000000000"), symbol: "T" }, // trillion
    { value: new Decimal("1000000000"), symbol: "B" }, // billion
    { value: new Decimal("1000000"), symbol: "M" }, // million
    { value: new Decimal("1000"), symbol: "K" }, // thousand
  ] as const;

  constructor(
    value: string | number,
    currency: string,
    options?: MoneyOptions,
  ) {
    this.amount = this.parseAmount(value);
    this.currencyConfig = this.getCurrencyConfig(currency);

    this.symbol = options?.symbol ?? this.currencyConfig.symbol;
    this.decimals = options?.decimals ?? this.currencyConfig.decimals;
    this.displayDecimals =
      options?.displayDecimals ?? this.currencyConfig.decimals;
    this.roundingMode = options?.roundingMode ?? ROUNDING_MODE.ROUND_HALF_EVEN;
  }

  /**
   * Creates a zero value Money instance for the specified currency.
   *
   * @param currency - The currency code
   * @param options - Optional configuration for the money instance
   * @returns A new Money instance with zero value
   *
   * @example
   * ```typescript
   * const zero = Money.zero('USD');
   * ```
   */
  static zero(currency: string, options?: MoneyOptions): Money {
    return new Money("0", currency, options);
  }

  /**
   * Creates a new Money instance from a value and currency.
   *
   * @param value - The monetary value
   * @param currency - The currency code
   * @param options - Optional configuration for the money instance
   * @returns A new Money instance
   */
  static from(
    value: string | number,
    currency: string,
    options?: MoneyOptions,
  ): Money {
    return new Money(value, currency, options);
  }

  /**
   * Adds another Money instance to this one.
   * Both instances must be of the same currency.
   *
   * @param other - The Money instance to add
   * @returns A new Money instance with the sum
   * @throws {Error} If currencies don't match
   *
   * @example
   * ```typescript
   * const sum = money1.add(money2);
   * ```
   */
  add(other: Money): Money {
    this.assertSameCurrency(other);

    return this.cloneWithNewAmount(this.amount.plus(other.amount));
  }

  /**
   * Subtracts another Money instance from this one.
   * Both instances must be of the same currency.
   *
   * @param other - The Money instance to subtract
   * @returns A new Money instance with the difference
   * @throws {Error} If currencies don't match
   */
  subtract(other: Money): Money {
    this.assertSameCurrency(other);

    return this.cloneWithNewAmount(this.amount.minus(other.amount));
  }

  /**
   * Multiplies the monetary value by a factor.
   *
   * @param factor - The multiplication factor
   * @returns A new Money instance with the product
   *
   * @example
   * ```typescript
   * const doubled = money.multiply(2);
   * ```
   */
  multiply(factor: number): Money {
    return this.cloneWithNewAmount(this.amount.times(factor));
  }

  /**
   * Divides the monetary value by a divisor.
   *
   * @param divisor - The number to divide by
   * @returns A new Money instance with the quotient
   * @throws {MoneyError} If divisor is zero
   */
  divide(divisor: number): Money {
    if (divisor === 0) {
      throw new MoneyError(ERROR_MESSAGES.DIVISION_BY_ZERO);
    }

    return this.cloneWithNewAmount(this.amount.dividedBy(divisor));
  }

  /**
   * Allocates the monetary amount according to ratios.
   * Useful for splitting money into parts while handling remainders.
   *
   * @param ratios - Array of ratio values for allocation
   * @returns Array of Money instances representing the allocated amounts
   * @throws {Error} If ratios array is empty
   *
   * @example
   * ```typescript
   * const shares = money.allocate([1, 1, 1]); // Split into three equal parts
   * ```
   */
  allocate(ratios: number[]): Money[] {
    if (ratios.length === 0) {
      throw new Error("Money: Cannot allocate to empty ratios");
    }

    const total = ratios.reduce((sum, ratio) => sum + ratio, 0);

    // Calculate the exact share amounts without rounding
    const allocations = ratios.map((ratio) => {
      const exact = this.amount.times(ratio).dividedBy(total);

      return {
        exact,
        amount: exact.toDecimalPlaces(this.decimals, Decimal.ROUND_DOWN),
      };
    });

    // Calculate how much is left to distribute
    const remainder = this.amount.minus(
      allocations.reduce((sum, share) => sum.plus(share.amount), new Decimal(0)),
    );

    // Convert to minor units for remainder distribution
    const remainderInMinorUnits = remainder
      .times(new Decimal(this.currencyConfig.minorUnits))
      .toNumber();

    // Calculate which shares should get an extra minor unit
    const sharesBySize = [...allocations].sort(
      (a, b) =>
        b.exact.minus(b.amount).times(total).toNumber() -
        a.exact.minus(a.amount).times(total).toNumber(),
    );

    // Distribute the remainder
    const minorUnit = new Decimal(1).dividedBy(
      new Decimal(this.currencyConfig.minorUnits),
    );

    const sharesToReceiveRemainder = sharesBySize.values();
    for (let i = 0; i < remainderInMinorUnits; i++) {
      const share = sharesToReceiveRemainder.next().value;
      if (!share) {
        throw new Error("Money: Cannot distribute allocation remainder");
      }

      share.amount = share.amount.plus(minorUnit);
    }

    return allocations.map(({ amount }) => {
      return new Money(amount.toString(), this.currencyConfig.code, {
        symbol: this.symbol,
        decimals: this.decimals,
        displayDecimals: this.displayDecimals,
        roundingMode: this.roundingMode,
      });
    });
  }

  /**
   * Checks if this Money instance equals another.
   *
   * @param other - The Money instance to compare with
   * @returns true if the instances are equal
   * @throws {Error} If currencies don't match
   */
  equals(other: Money): boolean {
    return this.compareAmount(other) === 0;
  }

  /**
   * Checks if this Money instance is greater than another.
   *
   * @param other - The Money instance to compare with
   * @returns true if this instance is greater
   * @throws {Error} If currencies don't match
   */
  greaterThan(other: Money): boolean {
    return this.compareAmount(other) > 0;
  }

  /**
   * Checks if this Money instance is less than another.
   *
   * @param other - The Money instance to compare with
   * @returns true if this instance is less
   * @throws {Error} If currencies don't match
   */
  lessThan(other: Money): boolean {
    return this.compareAmount(other) < 0;
  }

  /**
   * Checks if this Money instance is greater than or equal to another.
   *
   * @param other - The Money instance to compare with
   * @returns true if this instance is greater or equal
   * @throws {Error} If currencies don't match
   */
  greaterThanOrEqual(other: Money): boolean {
    return this.compareAmount(other) >= 0;
  }

  /**
   * Checks if this Money instance is less than or equal to another.
   *
   * @param other - The Money instance to compare with
   * @returns true if this instance is less or equal
   * @throws {Error} If currencies don't match
   */
  lessThanOrEqual(other: Money): boolean {
    return this.compareAmount(other) <= 0;
  }

  /**
   * Compares this Money instance with another and returns a comparison result object.
   *
   * @param other - The Money instance to compare with
   * @returns Object containing equality and comparison results
   * @throws {Error} If currencies don't match
   */
  compare(other: Money): MoneyComparisonResult {
    const comparison = this.compareAmount(other);

    return {
      equal: comparison === 0,
      greaterThan: comparison > 0,
      lessThan: comparison < 0,
    };
  }

  /**
   * Checks if the monetary value is zero.
   *
   * @returns true if the value is zero
   */
  isZero(): boolean {
    return this.amount.isZero();
  }

  /**
   * Checks if the monetary value is positive.
   *
   * @returns true if the value is positive
   */
  isPositive(): boolean {
    return this.amount.isPositive();
  }

  /**
   * Checks if the monetary value is negative.
   *
   * @returns true if the value is negative
   */
  isNegative(): boolean {
    return this.amount.isNegative();
  }

  /**
   * Returns the raw string value of the amount.
   *
   * @returns String representation of the monetary value
   */
  value(): string {
    return this.amount.toString();
  }

  /**
   * Returns the absolute value as a string.
   *
   * @returns String representation of the absolute monetary value
   */
  absoluteValue(): string {
    return this.amount.abs().toString();
  }

  /**
   * Returns the negated value as a string.
   *
   * @returns String representation of the negated monetary value
   */
  negatedValue(): string {
    return this.amount.negated().toString();
  }

  /**
   * Returns the formatted value according to the currency configuration.
   *
   * @returns Formatted string representation of the monetary value
   */
  formattedValue(): string {
    return this.applyFormatting(this.formatValue(), false);
  }

  /**
   * Returns the formatted value with the currency symbol.
   *
   * @returns Formatted string with currency symbol
   */
  formattedValueWithSymbol(): string {
    return this.applyFormatting(this.formatValue(), true);
  }

  /**
   * Returns a localized string representation using Intl.NumberFormat.
   *
   * @param locale - The locale to use for formatting
   * @param options - Additional Intl.NumberFormat options
   * @returns Localized string representation
   *
   * @example
   * ```typescript
   * money.toLocaleString('de-DE'); // "123,45 €"
   * ```
   */
  toLocaleString(
    locale?: Intl.LocalesArgument,
    options?: Intl.NumberFormatOptions,
  ): string {
    if (this.currencyConfig.isCrypto) {
      return this.formattedValueWithSymbol();
    }

    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: this.currencyConfig.code,
      ...options,
    }).format(this.amount.toNumber());
  }

  /**
   * Rounds the monetary value to the specified number of decimal places.
   *
   * @param decimals - Number of decimal places (defaults to instance decimals)
   * @returns A new Money instance with rounded value
   */
  round(decimals?: number): Money {
    const precision = decimals ?? this.decimals;

    return this.cloneWithNewAmount(
      this.amount.toDecimalPlaces(precision, this.roundingMode),
    );
  }

  /**
   * Converts this Money instance to another currency using another Money instance as the exchange rate basis.
   * The target Money instance represents how much 1 unit of the source currency is worth in the target currency.
   *
   * @param targetMoney - Money instance representing the exchange rate (1 unit of this currency in target currency)
   * @returns A new Money instance in the target currency
   * @throws {MoneyError} If the exchange rate Money is zero or negative
   *
   * @example
   * ```typescript
   * // If 1 USD = 0.85 EUR
   * const rate = new Money('0.85', 'EUR');
   * const usd = new Money('100.00', 'USD');
   * const eur = usd.convertTo(rate); // €85.00
   *
   * // If 1 EUR = 162.5 JPY
   * const rate = new Money('162.5', 'JPY');
   * const eur = new Money('50.00', 'EUR');
   * const jpy = eur.convertTo(rate); // ¥8,125
   * ```
   */
  convertTo(targetMoney: Money): Money {
    // Validate the exchange rate Money
    if (targetMoney.isNegative() || targetMoney.isZero()) {
      throw new MoneyError("Exchange rate must be greater than zero");
    }

    // Convert using the exchange rate
    return new Money(
      this.amount.times(targetMoney.amount).toString(),
      targetMoney.currencyConfig.code,
      {
        decimals: targetMoney.decimals,
        displayDecimals: targetMoney.displayDecimals,
        roundingMode: targetMoney.roundingMode,
      },
    );
  }

  /**
   * Returns an abbreviated string representation of the monetary value.
   * Formats large numbers using K (thousands), M (millions), B (billions), and T (trillions).
   * Numbers less than 1000 are not abbreviated.
   *
   * @param maxDecimals - Maximum number of decimal places to show in abbreviated form (default: 1)
   * @param withSymbol - Whether to include the currency symbol (default: true)
   * @returns Abbreviated string representation
   *
   * @example
   * ```typescript
   * new Money('1234', 'USD').abbreviatedValue(); // "$1.2K"
   * new Money('1234567', 'USD').abbreviatedValue(); // "$1.2M"
   * new Money('1234567890', 'USD').abbreviatedValue(); // "$1.2B"
   * new Money('1234567890123', 'USD').abbreviatedValue(); // "$1.2T"
   * ```
   */
  abbreviatedValue(maxDecimals = 1, withSymbol = false): string {
    const absValue = this.amount.abs();
    const formatted = this.formatWithScale(absValue, maxDecimals);

    return this.applyFormatting(formatted, withSymbol);
  }

  /**
   * Returns a JSON representation of the Money instance.
   *
   * @returns JSON object containing the money details
   */
  toJSON(): MoneyObject {
    return {
      currency: this.currencyConfig.code,
      symbol: this.symbol,
      decimals: this.decimals,
      displayDecimals: this.displayDecimals,
      value: this.value(),
      prettyValue: this.formattedValueWithSymbol(),
    };
  }

  /**
   * Returns a string representation of the Money instance.
   *
   * @returns Formatted string with currency symbol
   */
  toString(): string {
    return this.formattedValueWithSymbol();
  }

  private cloneWithNewAmount(amount: Decimal): Money {
    return new Money(amount.toString(), this.currencyConfig.code, {
      symbol: this.symbol,
      decimals: this.decimals,
      displayDecimals: this.displayDecimals,
      roundingMode: this.roundingMode,
    });
  }
  private parseAmount(value: string | number): Decimal {
    let amount: Decimal;

    try {
      amount = new Decimal(value);
    } catch {
      throw new MoneyError(ERROR_MESSAGES.INVALID_AMOUNT);
    }

    if (!amount.isFinite()) {
      throw new MoneyError(ERROR_MESSAGES.INVALID_AMOUNT);
    }

    return amount;
  }
  private assertSameCurrency(other: Money): void {
    if (this.currencyConfig.code !== other.currencyConfig.code) {
      throw new Error(
        `Money: Cannot operate on different currencies(current: "${this.currencyConfig.code}", other: "${other.currencyConfig.code}")`,
      );
    }
  }

  private compareAmount(other: Money): number {
    this.assertSameCurrency(other);
    return this.amount.comparedTo(other.amount);
  }
  private getCurrencyConfig(code: string): CurrencyConfig {
    const currencyConfig = Currency.getCurrency(code);

    if (!currencyConfig) {
      throw new Error(
        `Money: Currency config for ${code} not found. Config can be registered with "Currency.register(<CurrencyConfig>)"`,
      );
    }

    return currencyConfig;
  }
  private formatValue(): string {
    const roundedAmount = this.amount
      .toDecimalPlaces(this.displayDecimals, this.roundingMode)
      .abs();

    // Format with thousand separators and decimal separator
    const fixedAmount = roundedAmount.toFixed(this.displayDecimals);
    const decimalSeparatorIndex = fixedAmount.indexOf(".");

    // Replace every group of three digits in the integer part with the thousands separator
    const integerPart = fixedAmount
      .slice(
        0,
        decimalSeparatorIndex === -1
          ? fixedAmount.length
          : decimalSeparatorIndex,
      )
      .replace(
      /\B(?=(\d{3})+(?!\d))/g, // Regular expression to find positions for thousands separator
      this.currencyConfig.thousandsSeparator, // The thousands separator from the currency configuration
    );
    const decimalPart =
      decimalSeparatorIndex === -1
        ? ""
        : fixedAmount.slice(decimalSeparatorIndex + 1);

    return decimalPart
      ? `${integerPart}${this.currencyConfig.decimalSeparator}${decimalPart}`
      : integerPart;
  }
  private formatWithScale(value: Decimal, maxDecimals: number): string {
    const roundedValue = value.toDecimalPlaces(maxDecimals, this.roundingMode);

    const scale = Money.SCALES.find((s) =>
      roundedValue.greaterThanOrEqualTo(s.value),
    );

    if (!scale) {
      return roundedValue.toDecimalPlaces(this.displayDecimals).toString();
    }

    return `${roundedValue
      .dividedBy(scale.value)
      .toDecimalPlaces(maxDecimals)}${scale.symbol}`;
  }
  private applyFormatting(value: string, withSymbol: boolean): string {
    const formattedValue = withSymbol
      ? this.currencyConfig.symbolPosition === SYMBOL_POSITION.PREFIX
        ? `${this.symbol}${value}`
        : `${value}${this.symbol}`
      : value;

    return this.isPositive() ? formattedValue : `-${formattedValue}`;
  }
}
