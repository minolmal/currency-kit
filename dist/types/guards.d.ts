import { Money } from "../core/money";
import type { CurrencyConfig } from "./currency";
/**
 * Type guard to check if a value is a Money instance.
 *
 * @param value - The value to check
 * @returns True if the value is a Money instance
 *
 * @example
 * ```typescript
 * const value = new Money("100", "USD");
 * if (isMoney(value)) {
 *   console.log(value.toString()); // "$100.00"
 * }
 * ```
 */
export declare const isMoney: (value: unknown) => value is Money;
/**
 * Type guard to check if a value is a valid CurrencyConfig object.
 * Checks for the presence of required properties.
 *
 * @param value - The value to check
 * @returns True if the value is a valid CurrencyConfig
 *
 * @example
 * ```typescript
 * const config = {
 *   name: "US Dollar",
 *   code: "USD",
 *   symbol: "$"
 * };
 * if (isCurrencyConfig(config)) {
 *   Currency.register(config);
 * }
 * ```
 */
export declare const isCurrencyConfig: (value: unknown) => value is CurrencyConfig;
/**
 * Validates if a string is a valid currency code.
 * Currency codes must be exactly 3 uppercase letters.
 *
 * @param code - The currency code to validate
 * @returns True if the code is valid
 *
 * @example
 * ```typescript
 * console.log(isValidCurrencyCode("USD")); // true
 * console.log(isValidCurrencyCode("us")); // false
 * console.log(isValidCurrencyCode("USDD")); // false
 * ```
 */
export declare const isValidCurrencyCode: (code: string) => boolean;
