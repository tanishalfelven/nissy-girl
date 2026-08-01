import { wrap, clamp } from "$util/math.js";
import { createProgress, MIN_PROGRESS, MAX_PROGRESS } from "$util/progress.svelte.js";

export const ZOOM_ROTATION_THRESHOLD = 0.5;

let returnFromCartridgeFlow = $state(false);

export const rotation = createProgress({
	start : 0,
	speed : 1,
	anchors : [ 1 ],
	update : (cur, movement) => wrap(
		cur + movement,
		MIN_PROGRESS,
		MAX_PROGRESS,
	),
	velocity : {
		smoothing : 0.75,
	},
});

export const zoom = createProgress({
	start : 0,
	speed : 1.8,
	anchors : [ 1 ],
	update : (cur, movement) =>
		clamp(
			cur + Math.abs(movement) * (returnFromCartridgeFlow ? -1 : 1),
			MIN_PROGRESS,
			MAX_PROGRESS,
		),
	velocity : {
		decay : 0.9,
		smoothing : 0.9,
	},
});

export const camera = {
	get returnFromCartridgeFlow() {
		return returnFromCartridgeFlow;
	},

	setReturningFromCartridgeFlow() {
		returnFromCartridgeFlow = true;
	},

	clearReturningFromCartridgeFlow() {
		returnFromCartridgeFlow = false;
	},
};
