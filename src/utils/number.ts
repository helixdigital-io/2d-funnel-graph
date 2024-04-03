import { FormatNumber, OutputFormatter, RoundPoint } from "../types.ts";

export const roundPoint: RoundPoint = (number) => Math.round(number * 10) / 10;

export const formatNumber: FormatNumber = (number, precision = 2) =>
	Number(number.toFixed(precision));

export const outputFormatter: OutputFormatter = (number) =>
	number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
