import type { MoneyComparisonResult, MoneyObject, MoneyOptions } from "../types/money";
export declare class Money {
    private readonly amount;
    private readonly currencyConfig;
    private readonly symbol;
    private readonly decimals;
    private readonly displayDecimals;
    private readonly roundingMode;
    private static readonly SCALES;
    constructor(value: string | number, currency: string, options?: MoneyOptions);
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
    static zero(currency: string, options?: MoneyOptions): Money;
    /**
     * Creates a new Money instance from a value and currency.
     *
     * @param value - The monetary value
     * @param currency - The currency code
     * @param options - Optional configuration for the money instance
     * @returns A new Money instance
     */
    static from(value: string | number, currency: string, options?: MoneyOptions): Money;
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
    add(other: Money): Money;
    /**
     * Subtracts another Money instance from this one.
     * Both instances must be of the same currency.
     *
     * @param other - The Money instance to subtract
     * @returns A new Money instance with the difference
     * @throws {Error} If currencies don't match
     */
    subtract(other: Money): Money;
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
    multiply(factor: number): Money;
    /**
     * Divides the monetary value by a divisor.
     *
     * @param divisor - The number to divide by
     * @returns A new Money instance with the quotient
     * @throws {MoneyError} If divisor is zero
     */
    divide(divisor: number): Money;
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
    allocate(ratios: number[]): Money[];
    /**
     * Checks if this Money instance equals another.
     *
     * @param other - The Money instance to compare with
     * @returns true if the instances are equal
     * @throws {Error} If currencies don't match
     */
    equals(other: Money): boolean;
    /**
     * Checks if this Money instance is greater than another.
     *
     * @param other - The Money instance to compare with
     * @returns true if this instance is greater
     * @throws {Error} If currencies don't match
     */
    greaterThan(other: Money): boolean;
    /**
     * Checks if this Money instance is less than another.
     *
     * @param other - The Money instance to compare with
     * @returns true if this instance is less
     * @throws {Error} If currencies don't match
     */
    lessThan(other: Money): boolean;
    /**
     * Checks if this Money instance is greater than or equal to another.
     *
     * @param other - The Money instance to compare with
     * @returns true if this instance is greater or equal
     * @throws {Error} If currencies don't match
     */
    greaterThanOrEqual(other: Money): boolean;
    /**
     * Checks if this Money instance is less than or equal to another.
     *
     * @param other - The Money instance to compare with
     * @returns true if this instance is less or equal
     * @throws {Error} If currencies don't match
     */
    lessThanOrEqual(other: Money): boolean;
    /**
     * Compares this Money instance with another and returns a comparison result object.
     *
     * @param other - The Money instance to compare with
     * @returns Object containing equality and comparison results
     * @throws {Error} If currencies don't match
     */
    compare(other: Money): MoneyComparisonResult;
    /**
     * Checks if the monetary value is zero.
     *
     * @returns true if the value is zero
     */
    isZero(): boolean;
    /**
     * Checks if the monetary value is positive.
     *
     * @returns true if the value is positive
     */
    isPositive(): boolean;
    /**
     * Checks if the monetary value is negative.
     *
     * @returns true if the value is negative
     */
    isNegative(): boolean;
    /**
     * Returns the raw string value of the amount.
     *
     * @returns String representation of the monetary value
     */
    value(): string;
    /**
     * Returns the absolute value as a string.
     *
     * @returns String representation of the absolute monetary value
     */
    absoluteValue(): string;
    /**
     * Returns the negated value as a string.
     *
     * @returns String representation of the negated monetary value
     */
    negatedValue(): string;
    /**
     * Returns the formatted value according to the currency configuration.
     *
     * @returns Formatted string representation of the monetary value
     */
    formattedValue(): string;
    /**
     * Returns the formatted value with the currency symbol.
     *
     * @returns Formatted string with currency symbol
     */
    formattedValueWithSymbol(): string;
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
    toLocaleString(locale?: Intl.LocalesArgument, options?: Intl.NumberFormatOptions): string;
    /**
     * Rounds the monetary value to the specified number of decimal places.
     *
     * @param decimals - Number of decimal places (defaults to instance decimals)
     * @returns A new Money instance with rounded value
     */
    round(decimals?: number): Money;
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
    convertTo(targetMoney: Money): Money;
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
    abbreviatedValue(maxDecimals?: number, withSymbol?: boolean): string;
    /**
     * Returns a JSON representation of the Money instance.
     *
     * @returns JSON object containing the money details
     */
    toJSON(): MoneyObject;
    /**
     * Returns a string representation of the Money instance.
     *
     * @returns Formatted string with currency symbol
     */
    toString(): string;
    private cloneWithNewAmount;
    private parseAmount;
    private assertSameCurrency;
    private compareAmount;
    private getCurrencyConfig;
    private formatValue;
    private formatWithScale;
    private applyFormatting;
}
