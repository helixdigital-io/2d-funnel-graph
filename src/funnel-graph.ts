import { FunnelGraphData, FunnelGraphOptions } from "./types.js";
import {
	createSVGElement,
	generateLegendBackground,
	getDefaultColors,
	removeAttrs,
	setAttrs,
} from "./utils/graph.js";
import { formatNumber, outputFormatter, roundPoint } from "./utils/number.js";
import { createPath, createVerticalPath } from "./utils/path.js";
import { generateRandomIdString } from "./utils/random.js";

export class FunnelGraph {
	private colors: string[];
	private container?: HTMLElement;
	private containerSelector: HTMLElement | string;
	private data: FunnelGraphData;
	private direction: "horizontal" | "vertical";
	private displayPercent: boolean;
	private formatter: (value: number) => string;
	private gradientDirection: "horizontal" | "vertical";
	private graphContainer?: HTMLElement;
	private height?: number;
	private labels: string[];
	private percentages: number[];
	private precision: number;
	private subLabelValue: "percent" | "value";
	private subLabels: string[];

	private values: number[] | number[][];
	private width?: number;

	constructor(options: FunnelGraphOptions) {
		this.containerSelector = options.container;
		this.gradientDirection =
			options.gradientDirection === "vertical" ? "vertical" : "horizontal";
		this.direction =
			options.direction === "vertical" ? "vertical" : "horizontal";
		this.labels = FunnelGraph.getLabels(options);
		this.subLabels = FunnelGraph.getSubLabels(options);
		this.values = FunnelGraph.getValues(options);
		this.percentages = this.createPercentages();
		this.colors =
			options.data.colors ??
			getDefaultColors(this.is2d() ? this.getSubDataSize() : 2);
		this.displayPercent = options.displayPercent ?? false;
		this.data = options.data;
		this.height = options.height;
		this.width = options.width;
		this.subLabelValue = options.subLabelValue ?? "percent";
		this.precision = options.precision ?? 2;
		this.formatter = options.formatter ?? outputFormatter;
	}

	private addLabels(): void {
		const holder = document.createElement("div");
		holder.setAttribute("class", "svg-funnel-js__labels");

		this.percentages.forEach((percentage, index) => {
			const labelElement = document.createElement("div");
			labelElement.setAttribute(
				"class",
				`svg-funnel-js__label label-${(index + 1).toString()}`,
			);

			const title = document.createElement("div");
			title.setAttribute("class", "label__title");
			title.textContent = this.labels[index] || "";

			const value = document.createElement("div");
			value.setAttribute("class", "label__value");

			const valueNumber = this.is2d()
				? this.getValues2d()[index]
				: (this.values as number[])[index];
			value.textContent = this.formatter(
				formatNumber(valueNumber, this.precision),
			);

			const percentageValue = document.createElement("div");
			percentageValue.setAttribute("class", "label__percentage");
			percentageValue.textContent = `${percentage.toString()}%`;

			labelElement.appendChild(value);
			labelElement.appendChild(title);
			if (this.displayPercent) {
				labelElement.appendChild(percentageValue);
			}

			if (this.is2d()) {
				const segmentPercentages = document.createElement("div");
				segmentPercentages.setAttribute("class", "label__segment-percentages");
				let percentageList = '<ul class="segment-percentage__list">';

				const twoDimPercentages = this.getPercentages2d();

				this.subLabels.forEach((subLabel, j) => {
					const subLabelDisplayValue =
						this.subLabelValue === "percent"
							? `${twoDimPercentages[index][j].toString()}%`
							: this.formatter(
									formatNumber(
										(this.values as number[][])[index][j],
										this.precision,
									),
								);
					percentageList += `<li>${this.subLabels[j]}:
    <span class="percentage__list-label">${subLabelDisplayValue}</span>
 </li>`;
				});
				percentageList += "</ul>";
				segmentPercentages.innerHTML = percentageList;
				labelElement.appendChild(segmentPercentages);
			}

			holder.appendChild(labelElement);
		});

		this.container?.appendChild(holder);
	}

	private addSubLabels(): void {
		if (this.subLabels.length > 0) {
			const subLabelsHolder = document.createElement("div");
			subLabelsHolder.setAttribute("class", "svg-funnel-js__subLabels");

			let subLabelsHTML = "";

			this.subLabels.forEach((subLabel, index) => {
				subLabelsHTML += `<div class="svg-funnel-js__subLabel svg-funnel-js__subLabel-${(index + 1).toString()}">
    <div class="svg-funnel-js__subLabel--color"
        style="${generateLegendBackground(this.colors[index], this.gradientDirection)}"></div>
    <div class="svg-funnel-js__subLabel--title">${subLabel}</div>
</div>`;
			});

			subLabelsHolder.innerHTML = subLabelsHTML;
			this.container?.appendChild(subLabelsHolder);
		}
	}

	private applyGradient(
		svg: SVGElement,
		path: SVGPathElement,
		colors: string[],
		index: number,
	): void {
		const defs =
			svg.querySelector("defs") === null
				? createSVGElement("defs", svg)
				: svg.querySelector("defs")!;

		const gradientName = generateRandomIdString(
			`funnelGradient-${index.toString()}-`,
		);

		const gradient = createSVGElement("linearGradient", defs, {
			id: gradientName,
		});

		if (this.gradientDirection === "vertical") {
			setAttrs(gradient, {
				x1: "0",
				x2: "0",
				y1: "0",
				y2: "1",
			});
		}

		const numberOfColors = colors.length;

		for (let i = 0; i < numberOfColors; i++) {
			createSVGElement("stop", gradient, {
				offset: `${Math.round((100 * i) / (numberOfColors - 1)).toString()}%`,
				"stop-color": colors[i],
			});
		}

		setAttrs(path, {
			fill: `url("#${gradientName}")`,
			stroke: `url("#${gradientName}")`,
		});
	}

	private createContainer(): void {
		if (!this.containerSelector) {
			throw new Error("Container is missing");
		}

		if (typeof this.containerSelector === "string") {
			this.container = document.querySelector(this.containerSelector)!;
		} else if (this.container instanceof HTMLElement) {
			this.container = this.containerSelector;
		} else {
			throw new Error(
				"Container must either be a selector string or an HTMLElement.",
			);
		}

		this.container.classList.add("svg-funnel-js");

		this.graphContainer = document.createElement("div");
		this.graphContainer.classList.add("svg-funnel-js__container");
		this.container.appendChild(this.graphContainer);

		if (this.direction === "vertical") {
			this.container.classList.add("svg-funnel-js--vertical");
		}
	}

	private createPercentages(): number[] {
		let values: number[] = [];

		if (this.is2d()) {
			values = this.getValues2d();
		} else {
			values = [...(this.values as number[])];
		}

		const max = Math.max(...values);
		return values.map((value) =>
			value === 0 ? 0 : roundPoint((value * 100) / max),
		);
	}

	private drawPaths(): void {
		const svg = this.getSVG();
		const paths = svg.querySelectorAll("path");
		const definitions = this.getPathDefinitions();

		definitions.forEach((definition, index) => {
			paths[index].setAttribute("d", definition);
		});
	}

	private getCrossAxisPoints(): number[][] {
		const points: number[][] = [];
		const fullDimension = this.getFullDimension();
		const dimension = fullDimension / 2;

		if (this.is2d()) {
			const totalValues = this.getValues2d();
			const max = Math.max(...totalValues);

			totalValues.push([...totalValues].pop()!);
			points.push(
				totalValues.map((value) =>
					roundPoint(((max - value) / max) * dimension),
				),
			);

			const percentagesFull = this.getPercentages2d();
			const pointsOfFirstPath = points[0];

			for (let i = 1; i < this.getSubDataSize(); i++) {
				const p = points[i - 1];
				const newPoints: number[] = [];

				for (let j = 0; j < this.getDataSize(); j++) {
					newPoints.push(
						roundPoint(
							p[j] +
								(fullDimension - pointsOfFirstPath[j] * 2) *
									(percentagesFull[j][i - 1] / 100),
						),
					);
				}

				newPoints.push([...newPoints].pop()!);
				points.push(newPoints);
			}

			points.push(pointsOfFirstPath.map((point) => fullDimension - point));
		} else {
			const max = Math.max(...(this.values as number[]));
			const values = [...(this.values as number[])].concat(
				[...(this.values as number[])].pop()!,
			);
			points.push(
				values.map((value) => roundPoint(((max - value) / max) * dimension)),
			);
			points.push(points[0].map((point) => fullDimension - point));
		}

		return points;
	}

	private getDataSize(): number {
		return (this.values as number[]).length;
	}

	private getFullDimension(): number {
		return this.isVertical() ? this.getWidth() : this.getHeight();
	}

	private getGraphType(): "2d" | "normal" {
		return this.values.length > 0 && Array.isArray(this.values[0])
			? "2d"
			: "normal";
	}

	private getHeight(): number {
		return this.height ?? this.graphContainer?.clientHeight ?? 0;
	}

	private static getLabels(options: FunnelGraphOptions): string[] {
		const { data } = options;

		if (typeof data.labels === "undefined") {
			return [];
		}

		return data.labels;
	}

	private getMainAxisPoints(): number[] {
		const size = this.getDataSize();
		const points: number[] = [];
		const fullDimension = this.isVertical()
			? this.getHeight()
			: this.getWidth();
		for (let i = 0; i <= size; i++) {
			points.push(roundPoint((fullDimension * i) / size));
		}

		return points;
	}

	private getPathDefinitions(): string[] {
		const valuesNum = this.getCrossAxisPoints().length - 1;
		const paths: string[] = [];
		for (let i = 0; i < valuesNum; i++) {
			if (this.isVertical()) {
				const X = this.getCrossAxisPoints()[i];
				const XNext = this.getCrossAxisPoints()[i + 1];
				const Y = this.getMainAxisPoints();

				const d = createVerticalPath(i, X, XNext, Y);
				paths.push(d);
			} else {
				const X = this.getMainAxisPoints();
				const Y = this.getCrossAxisPoints()[i];
				const YNext = this.getCrossAxisPoints()[i + 1];

				const d = createPath(i, X, Y, YNext);
				paths.push(d);
			}
		}

		return paths;
	}

	private getPathMedian(i: number): string {
		if (this.isVertical()) {
			const cross = this.getCrossAxisPoints()[i];
			const next = this.getCrossAxisPoints()[i + 1];
			const Y = this.getMainAxisPoints();
			const X: number[] = [];
			const XNext: number[] = [];

			cross.forEach((point, index) => {
				const m = (point + next[index]) / 2;
				X.push(m - 1);
				XNext.push(m + 1);
			});

			return createVerticalPath(i, X, XNext, Y);
		}

		const X = this.getMainAxisPoints();
		const cross = this.getCrossAxisPoints()[i];
		const next = this.getCrossAxisPoints()[i + 1];
		const Y: number[] = [];
		const YNext: number[] = [];

		cross.forEach((point, index) => {
			const m = (point + next[index]) / 2;
			Y.push(m - 1);
			YNext.push(m + 1);
		});

		return createPath(i, X, Y, YNext);
	}

	private getPercentages2d(): number[][] {
		const percentages: number[][] = [];

		(this.values as number[][]).forEach((valueSet) => {
			const total = valueSet.reduce((sum, value) => sum + value, 0);
			percentages.push(
				valueSet.map((value) =>
					total === 0 ? 0 : roundPoint((value * 100) / total),
				),
			);
		});

		return percentages;
	}

	private getSVG(): SVGElement {
		const svg = this.container?.querySelector("svg");

		if (!svg) {
			throw new Error("No SVG found inside of the container");
		}

		return svg;
	}

	private getSubDataSize(): number {
		return (this.values as number[][])[0].length;
	}

	private static getSubLabels(options: FunnelGraphOptions): string[] {
		const { data } = options;

		if (typeof data.subLabels === "undefined") {
			return [];
		}

		return data.subLabels;
	}

	private static getValues(options: FunnelGraphOptions): number[] | number[][] {
		const { data } = options;

		if (typeof data === "object") {
			return data.values ?? [];
		}

		return [];
	}

	private getValues2d(): number[] {
		const values: number[] = [];

		(this.values as number[][]).forEach((valueSet) => {
			values.push(valueSet.reduce((sum, value) => sum + value, 0));
		});

		return values;
	}

	private getWidth(): number {
		return this.width ?? this.graphContainer?.clientWidth ?? 0;
	}

	private is2d(): boolean {
		return this.getGraphType() === "2d";
	}

	private isVertical(): boolean {
		return this.direction === "vertical";
	}

	private makeSVG(): void {
		const svg = createSVGElement("svg", this.graphContainer, {
			height: this.getHeight().toString(),
			width: this.getWidth().toString(),
		});

		const valuesNum = this.getCrossAxisPoints().length - 1;
		for (let i = 0; i < valuesNum; i++) {
			const path = createSVGElement<SVGPathElement>("path", svg);

			const color = this.is2d() ? this.colors[i] : this.colors;
			const fillMode =
				typeof color === "string" || color.length === 1 ? "solid" : "gradient";

			if (fillMode === "solid") {
				const solidColor = typeof color === "string" ? color : color[0];
				setAttrs(path, {
					fill: solidColor,
					stroke: solidColor,
				});
			} else {
				this.applyGradient(svg, path, color, i + 1);
			}

			svg.appendChild(path);
		}

		this.graphContainer?.appendChild(svg);
	}

	draw(): void {
		this.createContainer();
		this.makeSVG();

		this.addLabels();

		if (this.is2d()) {
			this.addSubLabels();
		}

		this.drawPaths();
	}

	gradientMakeHorizontal(): boolean {
		if (this.gradientDirection === "horizontal") {
			return true;
		}

		this.gradientDirection = "horizontal";
		const gradients = this.graphContainer?.querySelectorAll("linearGradient");

		for (let i = 0; i < gradients.length; i++) {
			removeAttrs(gradients[i], "x1", "x2", "y1", "y2");
		}

		return true;
	}

	gradientMakeVertical(): boolean {
		if (this.gradientDirection === "vertical") {
			return true;
		}

		this.gradientDirection = "vertical";
		const gradients = this.graphContainer?.querySelectorAll("linearGradient");

		for (let i = 0; i < gradients.length; i++) {
			setAttrs(gradients[i], {
				x1: "0",
				x2: "0",
				y1: "0",
				y2: "1",
			});
		}

		return true;
	}

	gradientToggleDirection(): void {
		if (this.gradientDirection === "horizontal") {
			this.gradientMakeVertical();
		} else {
			this.gradientMakeHorizontal();
		}
	}

	makeHorizontal(): boolean {
		if (this.direction === "horizontal") {
			return true;
		}

		this.direction = "horizontal";
		this.container?.classList.remove("svg-funnel-js--vertical");

		const svg = this.getSVG();
		const height = this.getHeight();
		const width = this.getWidth();
		setAttrs(svg, { height: height.toString(), width: width.toString() });

		this.drawPaths();

		return true;
	}

	makeVertical(): boolean {
		if (this.direction === "vertical") {
			return true;
		}

		this.direction = "vertical";
		this.container?.classList.add("svg-funnel-js--vertical");

		const svg = this.getSVG();
		const height = this.getHeight();
		const width = this.getWidth();
		setAttrs(svg, { height: height.toString(), width: width.toString() });

		this.drawPaths();

		return true;
	}

	setDirection(d: "horizontal" | "vertical"): this {
		this.direction = d;
		return this;
	}

	setHeight(h: number): this {
		this.height = h;
		return this;
	}

	setValues(v: number[] | number[][]): this {
		this.values = v;
		return this;
	}

	setWidth(w: number): this {
		this.width = w;
		return this;
	}

	toggleDirection(): void {
		if (this.direction === "horizontal") {
			this.makeVertical();
		} else {
			this.makeHorizontal();
		}
	}

	update(o: Partial<FunnelGraphOptions>): void {
		if (typeof o.displayPercent !== "undefined") {
			if (this.displayPercent !== o.displayPercent) {
				if (this.displayPercent) {
					this.container
						?.querySelectorAll(".label__percentage")
						.forEach((label) => {
							label.remove();
						});
				} else {
					this.container
						?.querySelectorAll(".svg-funnel-js__label")
						.forEach((label, index) => {
							const percentage = this.percentages[index];
							const percentageValue = document.createElement("div");
							percentageValue.setAttribute("class", "label__percentage");

							if (percentage !== 100) {
								percentageValue.textContent = `${percentage.toString()}%`;
								label.appendChild(percentageValue);
							}
						});
				}
			}
		}

		if (typeof o.height !== "undefined") {
			this.updateHeight(o.height);
		}

		if (typeof o.width !== "undefined") {
			this.updateWidth(o.width);
		}

		if (typeof o.gradientDirection !== "undefined") {
			if (o.gradientDirection === "vertical") {
				this.gradientMakeVertical();
			} else {
				this.gradientMakeHorizontal();
			}
		}

		if (typeof o.direction !== "undefined") {
			if (o.direction === "vertical") {
				this.makeVertical();
			} else {
				this.makeHorizontal();
			}
		}

		if (typeof o.data !== "undefined") {
			this.updateData(o.data);
		}
	}

	updateData(d: FunnelGraphData): void {
		const labels = this.container?.querySelector(".svg-funnel-js__labels");
		const subLabels = this.container?.querySelector(
			".svg-funnel-js__subLabels",
		);

		if (labels) {
			labels.remove();
		}

		if (subLabels) {
			subLabels.remove();
		}

		this.labels = [];
		this.colors = getDefaultColors(this.is2d() ? this.getSubDataSize() : 2);
		this.values = [];
		this.percentages = [];

		if (typeof d.labels !== "undefined") {
			this.labels = FunnelGraph.getLabels({ data: d });
		}

		if (typeof d.colors !== "undefined") {
			this.colors = d.colors;
		}

		if (typeof d.values !== "undefined") {
			if (
				Object.prototype.toString.call(d.values[0]) !==
				Object.prototype.toString.call(this.values[0])
			) {
				this.container?.querySelector("svg")?.remove();
				this.values = FunnelGraph.getValues({ data: d });
				this.makeSVG();
			} else {
				this.values = FunnelGraph.getValues({ data: d });
			}

			this.drawPaths();
		}

		this.percentages = this.createPercentages();

		this.addLabels();

		if (typeof d.subLabels !== "undefined") {
			this.subLabels = FunnelGraph.getSubLabels({ data: d });
			this.addSubLabels();
		}
	}

	updateHeight(h: number): boolean {
		this.height = h;
		const svg = this.getSVG();
		const height = this.getHeight();
		setAttrs(svg, { height: height.toString() });

		this.drawPaths();

		return true;
	}

	updateWidth(w: number): boolean {
		this.width = w;
		const svg = this.getSVG();
		const width = this.getWidth();
		setAttrs(svg, { width: width.toString() });

		this.drawPaths();

		return true;
	}
}
