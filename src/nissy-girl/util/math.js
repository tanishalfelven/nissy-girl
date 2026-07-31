import {
	MIN_PROGRESS,
	MAX_PROGRESS,
} from "./progress.svelte.js";

export const roundHundredths = n => Math.floor(n * 100) / 100;

export const clamp = (value, min, max) => Math.min(max, Math.max(value, min));

export const wrap = (value, min, max) => {
	const range = max - min;

	return ((value - min) % range + range) % range + min;
};

export const inRange = (num, min, max) =>
	min <= num && num <= max;

export const range = (progress, start, end) =>
	clamp((progress - start) / (end - start), 0, 1);

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

export const lerp = (min, max, t) => min + (max - min) * t;
