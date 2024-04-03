export type GenerateRandomIdString = (prefix?: string) => string;

export type RoundPoint = (number: number) => number;
export type FormatNumber = (number: number, precision?: number) => number;
export type OutputFormatter = (number: number) => string;

export type SetAttrs = (
	element: Element,
	attributes: Record<string, string>,
) => void;
export type RemoveAttrs = (element: Element, ...attributes: string[]) => void;
export type CreateSVGElement = (
	element: string,
	container?: Element,
	attributes?: Record<string, string>,
) => Element;
export type GenerateLegendBackground = (
	color: string | string[],
	direction?: "horizontal" | "vertical",
) => string;
export type GetDefaultColors = (number: number) => string[];
export type NestedArray<T> = (NestedArray<T> | T)[];
export type AreEqual = <T>(
	value: NestedArray<T>,
	newValue: NestedArray<T>,
) => boolean;
