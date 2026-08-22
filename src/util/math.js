import {
	MIN_PROGRESS,
	MAX_PROGRESS,
} from "./progress.svelte.js";

export const roundDigit = (value, digits) => Math.round(value * 10 ** digits) / 10 ** digits;

export const roundHundredths = (value) => roundDigit(value, 2);

export const clamp = (value, min, max) => Math.min(max, Math.max(value, min));

export const wrap = (value, min, max) => {
	const range = max - min;

	return ((value - min) % range + range) % range + min;
};

export const inRange = (value, min, max) =>
	min <= value && value <= max;

export const lerp = (value, min, max) => min + (max - min) * value;

export const randRange = (min, max) => lerp(Math.random(), min, max);
export const randBool = () => Math.round(Math.random()) === 0;

export const crossedThreshold = (from, to, threshold) =>
	(from <= threshold && to >= threshold)
	|| (from >= threshold && to <= threshold);

export const crossedWrap = (from, to) =>
	Math.abs(to - from) > 0.5;

export const crossedThresholdWrapInclusive = (from, to, threshold) => {
	const isBoundaryWrap = threshold === MIN_PROGRESS || threshold === MAX_PROGRESS;
	const crossedWrapPoint = crossedWrap(from, to);

	return (!crossedWrapPoint && crossedThreshold(from, to, threshold))
		|| (isBoundaryWrap && crossedWrapPoint);
};
