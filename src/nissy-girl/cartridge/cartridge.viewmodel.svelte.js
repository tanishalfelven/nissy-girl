import { createProgress, MIN_PROGRESS, MAX_PROGRESS } from "../util/progress.svelte.js";
import { clamp } from "../util/math.js";

export const CARTRIDGE_SELECTION_THRESHOLD = 0.5;

export const cartridgeX = createProgress({
	start : 0,
	speed : -0.9,
	anchors : [ CARTRIDGE_SELECTION_THRESHOLD ],
	update : (cur, movement) => clamp(
		cur + movement,
		MIN_PROGRESS,
		MAX_PROGRESS,
	),
	velocity : {
		smoothing : 0.6,
		decay : 0.92,
	},
});

export const cartridgeY = createProgress({
	start : 0,
	speed : 0.7,
	anchors : [ 0, 1 ],
	update : (cur, movement) =>
		clamp(
			cur + movement,
			MIN_PROGRESS,
			MAX_PROGRESS,
		),
	velocity : {
		smoothing : 0.7,
		decay : 0.9,
		min : 0.0001,
	},
});

let isVisible = $state(false);

export const cartridges = {
	get isVisible() {
		return isVisible;
	},

	show() {
		isVisible = true;
	},

	hide() {
		isVisible = false;
	},
};
