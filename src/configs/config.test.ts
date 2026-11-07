import { describe, expect, it } from "bun:test";
import { SYMBOL_POSITION } from "@/constants/symbols";
import { EUR_CONFIG, GBP_CONFIG, LKR_CONFIG, USD_CONFIG } from ".";

describe("Default Currency Configurations", () => {
	describe("USD Configuration", () => {
		it("has correct properties", () => {
			expect(USD_CONFIG).toEqual({
				name: "United States Dollar",
				code: "USD",
				symbol: "$",
				symbolPosition: SYMBOL_POSITION.PREFIX,
				decimalSeparator: ".",
				decimals: 2,
				minorUnits: "100",
				thousandsSeparator: ",",
				isCrypto: false,
			});
		});
	});

	describe("EUR Configuration", () => {
		it("has correct properties", () => {
			expect(EUR_CONFIG).toEqual({
				name: "Euro",
				code: "EUR",
				symbol: "€",
				symbolPosition: SYMBOL_POSITION.PREFIX,
				decimalSeparator: ".",
				decimals: 2,
				minorUnits: "100",
				thousandsSeparator: ",",
				isCrypto: false,
			});
		});
	});

	describe("GBP Configuration", () => {
		it("has correct properties", () => {
			expect(GBP_CONFIG).toEqual({
				name: "British Pound",
				code: "GBP",
				symbol: "£",
				symbolPosition: SYMBOL_POSITION.PREFIX,
				decimalSeparator: ".",
				decimals: 2,
				minorUnits: "100",
				thousandsSeparator: ",",
				isCrypto: false,
			});
		});
	});

	describe("LKR Configuration", () => {
		it("has correct properties", () => {
			expect(LKR_CONFIG).toEqual({
				name: "Sri Lankan Rupees",
				code: "LKR",
				symbol: "Rs",
				symbolPosition: SYMBOL_POSITION.PREFIX,
				decimalSeparator: ".",
				decimals: 2,
				minorUnits: "100",
				thousandsSeparator: ",",
				isCrypto: false,
			});
		});
	});
});
