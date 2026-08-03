import {
	MIN_PROGRESS,
	MAX_PROGRESS,
} from "./progress.svelte.js";

/** @import { Rect } from "$games/shared/renderable.consts.js" */

export const roundHundredths = (n) => Math.floor(n * 100) / 100;

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

/**
 * intersection of two rects, or false when they don't overlap
 * @param {Rect} a
 * @param {Rect} b
 * @returns {Rect|false}
 */
export const intersectRects = (a, b) => {
	const x = Math.max(a.x, b.x);
	const y = Math.max(a.y, b.y);
	const right = Math.min(a.x + a.width, b.x + b.width);
	const bottom = Math.min(a.y + a.height, b.y + b.height);

	if(right <= x || bottom <= y) {
		return false;
	}

	return { x, y, width : right - x, height : bottom - y };
};

/**
 * smallest rect containing both rects
 * @param {Rect} a
 * @param {Rect} b
 * @returns {Rect}
 */
export const unionRects = (a, b) => {
	const x = Math.min(a.x, b.x);
	const y = Math.min(a.y, b.y);
	const right = Math.max(a.x + a.width, b.x + b.width);
	const bottom = Math.max(a.y + a.height, b.y + b.height);

	return { x, y, width : right - x, height : bottom - y };
};

export const isEmptyRect = (rect) => rect.width <= 0 || rect.height <= 0;
