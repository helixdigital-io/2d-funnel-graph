export type GenerateRandomIdString = (prefix?: string) => string;

export type RoundPoint = (number: number) => number;
export type FormatNumber = (number: number, precision?: number) => number;
export type OutputFormatter = (number: number) => string;

export type SetAttrs = (
	element: Element,
	attributes: Record<string, string>,
) => void;
export type RemoveAttrs = (element: Element, ...attributes: string[]) => void;
export type CreateSVGElement = <T extends SVGElement>(
	element: string,
	container?: SVGElement | null,
	attributes?: Record<string, string>,
) => T;
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

export type CreateCurves = (
	x1: number,
	y1: number,
	x2: number,
	y2: number,
) => string;
export type CreateVerticalCurves = (
	x1: number,
	y1: number,
	x2: number,
	y2: number,
) => string;
export type CreatePath = (
	index: number,
	X: number[],
	Y: number[],
	YNext: number[],
) => string;
export type CreateVerticalPath = (
	index: number,
	X: number[],
	XNext: number[],
	Y: number[],
) => string;

export interface FunnelGraphData {
	colors?: string[];
	labels?: string[];
	subLabels?: string[];
	values?: number[] | number[][];
}

export interface FunnelGraphOptions {
	container: HTMLElement | string;
	data: FunnelGraphData;
	direction?: "horizontal" | "vertical";
	displayPercent?: boolean;
	formatter?: (value: number) => string;
	gradientDirection?: "horizontal" | "vertical";
	height?: number;
	precision?: number;
	subLabelValue?: "percent" | "value";
	width?: number;
}
