import { wrap, clamp, crossedThresholdWrapInclusive, roundHundredths } from "$util/math.js";
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

const VISIBLE_ROTATION_SWEEP = 50;

const displayRotation = $derived(roundHundredths(rotation.progress * 360));
const backfaceHidden = $derived(displayRotation < VISIBLE_ROTATION_SWEEP
	|| displayRotation > (360 - VISIBLE_ROTATION_SWEEP));

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
	get displayRotation() {
		return displayRotation;
	},

	get backfaceHidden() {
		return backfaceHidden;
	},

	returnFromCartridgeFlow() {
		return returnFromCartridgeFlow;
	},

	isMaxZoomedOut() {
		return zoom.progress === MAX_PROGRESS;
	},

	isMaxZoomedIn() {
		return zoom.progress === MIN_PROGRESS;
	},

	enteringZoomAngle(delta) {
		const isEnteringZoomAngle = crossedThresholdWrapInclusive(
			rotation.progress,
			rotation.project(delta),
			ZOOM_ROTATION_THRESHOLD,
		);

		// this is odd for not being a pure function but its nice to encapsulate
		if(isEnteringZoomAngle) {
			rotation.set(ZOOM_ROTATION_THRESHOLD);
		}

		return isEnteringZoomAngle;
	},

	isCurrentlyAtZoomAngle() {
		return rotation.progress === ZOOM_ROTATION_THRESHOLD
			&& returnFromCartridgeFlow;
	},

	setReturningFromCartridgeFlow() {
		returnFromCartridgeFlow = true;
	},

	clearReturningFromCartridgeFlow() {
		returnFromCartridgeFlow = false;
	},
};
