import {
	AreEqual,
	CreateSVGElement,
	GenerateLegendBackground,
	GetDefaultColors,
	NestedArray,
	RemoveAttrs,
	SetAttrs,
} from "../types.js";

export const defaultColors: string[] = [
	"#FF4589",
	"#FF5050",
	"#05DF9D",
	"#4FF2FD",
	"#2D9CDB",
	"#A0BBFF",
	"#FFD76F",
	"#F2C94C",
	"#FF9A9A",
	"#FFB178",
];

export const setAttrs: SetAttrs = (element, attributes) => {
	if (typeof attributes === "object") {
		Object.keys(attributes).forEach((key) => {
			element.setAttribute(key, attributes[key]);
		});
	}
};

export const removeAttrs: RemoveAttrs = (element, ...attributes) => {
	attributes.forEach((attribute) => {
		element.removeAttribute(attribute);
	});
};

export const createSVGElement: CreateSVGElement = <T extends SVGElement>(
	element: string,
	container?: SVGElement | null,
	attributes?: Record<string, string>,
): T => {
	const el = document.createElementNS(
		"http://www.w3.org/2000/svg",
		element,
	) as T;

	if (typeof attributes === "object") {
		setAttrs(el, attributes);
	}

	if (container !== undefined && container !== null) {
		container.appendChild(el);
	}

	return el;
};

export const generateLegendBackground: GenerateLegendBackground = (
	color,
	direction = "horizontal",
) => {
	if (typeof color === "string") {
		return `background-color: ${color}`;
	}

	if (color.length === 1) {
		return `background-color: ${color[0]}`;
	}

	return `background-image: linear-gradient(${direction === "horizontal" ? "to right, " : ""}${color.join(", ")})`;
};

export const getDefaultColors: GetDefaultColors = (number) => {
	const colors = [...defaultColors];
	const colorSet: string[] = [];

	for (let i = 0; i < number; i++) {
		const index = Math.abs(Math.round(Math.random() * (colors.length - 1)));
		colorSet.push(colors[index]);
		colors.splice(index, 1);
	}

	return colorSet;
};

export const areEqual: AreEqual = <T>(
	value: NestedArray<T>,
	newValue: NestedArray<T>,
): boolean => {
	if (!Array.isArray(value) || !Array.isArray(newValue)) {
		return false;
	}

	if (value.length !== newValue.length) {
		return false;
	}

	return value.every((item, index) => {
		const newItem = newValue[index];
		if (Array.isArray(item) && Array.isArray(newItem)) {
			return areEqual(item, newItem);
		}

		return item === newItem;
	});
};
