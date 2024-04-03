import { GenerateRandomIdString } from "../types.ts";

export const generateRandomIdString: GenerateRandomIdString = (prefix = "") =>
	Math.random()
		.toString(36)
		.replace("0.", prefix || "");
