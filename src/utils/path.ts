import {
	CreateCurves,
	CreatePath,
	CreateVerticalCurves,
	CreateVerticalPath,
} from "../types.js";
import { roundPoint } from "./number.js";

export const createCurves: CreateCurves = (x1, y1, x2, y2) =>
	` C${roundPoint((x2 + x1) / 2).toString()},${y1.toString()} ` +
	`${roundPoint((x2 + x1) / 2).toString()},${y2.toString()} ${x2.toString()},${y2.toString()}`;

export const createVerticalCurves: CreateVerticalCurves = (x1, y1, x2, y2) =>
	` C${x1.toString()},${roundPoint((y2 + y1) / 2).toString()} ` +
	`${x2.toString()},${roundPoint((y2 + y1) / 2).toString()} ${x2.toString()},${y2.toString()}`;

export const createPath: CreatePath = (index, X, Y, YNext) => {
	let str = `M${X[0].toString()},${Y[0].toString()}`;

	for (let i = 0; i < X.length - 1; i++) {
		str += createCurves(X[i], Y[i], X[i + 1], Y[i + 1]);
	}

	str += ` L${[...X].pop()?.toString() ?? ""},${[...YNext].pop()?.toString() ?? ""}`;

	for (let i = X.length - 1; i > 0; i--) {
		str += createCurves(X[i], YNext[i], X[i - 1], YNext[i - 1]);
	}

	str += " Z";

	return str;
};

export const createVerticalPath: CreateVerticalPath = (index, X, XNext, Y) => {
	let str = `M${X[0].toString()},${Y[0].toString()}`;

	for (let i = 0; i < X.length - 1; i++) {
		str += createVerticalCurves(X[i], Y[i], X[i + 1], Y[i + 1]);
	}

	str += ` L${[...XNext].pop()?.toString() ?? ""},${[...Y].pop()?.toString() ?? ""}`;

	for (let i = X.length - 1; i > 0; i--) {
		str += createVerticalCurves(XNext[i], Y[i], XNext[i - 1], Y[i - 1]);
	}

	str += " Z";

	return str;
};
