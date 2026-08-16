import { createProgress, MIN_PROGRESS, MAX_PROGRESS } from "$util/progress.svelte.js";
import { clamp } from "$util/math.js";
import { gameOrder, games, getGameIndex } from "$game/games.js";
import { nissyGirl } from "$nissy-girl/nissy-girl.viewmodel.svelte.js";
import { camera } from "$nissy-girl/camera.viewmodel.svelte.js";

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

let dir = $state(0);
let index = $state(0);
let isVisible = $state(false);
let finishedIteratingCartridge = $state(false);

export const cartridges = {
	get isVisible() {
		return isVisible && !camera.backfaceHidden;
	},

	show() {
		isVisible = true;
	},

	hide() {
		isVisible = false;
	},

	getCurrentCartridgeId() {
		if(!gameOrder[index]) {
			/* eslint-disable-next-line */
			console.warn(`[cartridges.getCurrentCartridgeId]: Index ${index} invalid for game order.`);

			return false;
		}

		return gameOrder[index];
	},

	getCurrentCartridgeGame() {
		const id = this.getCurrentCartridgeId();

		// cartridges that aren't in game order can exist :)
		if(nissyGirl.hasInsertedCartridge()) {
			return nissyGirl.getGame();
		}

		if(!games.has(id)) {
			/* eslint-disable-next-line */
			console.warn(`[cartridges.getCurrentCartridgeGame]: Id ${id} not in games.`);

			return false;
		}

		return games.get(id);
	},

	resetCartridgePosition() {
		cartridgeX.set(dir < 0 ? MIN_PROGRESS : MAX_PROGRESS);
	},

	setDirection(newDir) {
		dir = newDir;

		this.resetCartridgePosition();

		// index starts from same swiping direction
		index = dir < 0 ? gameOrder.length - 1 : 0;

		finishedIteratingCartridge = false;
	},

	step(stepDir = 0) {
		if(stepDir === 0) {
			/* eslint-disable-next-line */
			console.warn("[cartridges.step]: Received direction 0 for cartridge step.");

			return false;
		}

		this.resetCartridgePosition();

		index += stepDir;

		if(index === -1 || index === gameOrder.length) {
			index = 0;
			finishedIteratingCartridge = true;
		}
	},

	isFinishedIterating() {
		return finishedIteratingCartridge;
	},

	isCartridgeEjected() {
		return cartridgeY.progress < 0.96;
	},

	isOffScreen() {
		return cartridgeX.progress === MAX_PROGRESS
			|| cartridgeX.progress === MIN_PROGRESS;
	},

	cartridgePositionedOverConsole() {
		return cartridgeX.progress === CARTRIDGE_SELECTION_THRESHOLD;
	},

	isReturnedToCarousel() {
		return cartridgeY.progress === MIN_PROGRESS;
	},

	isFullyInserted() {
		return cartridgeY.progress === MAX_PROGRESS;
	},

	setInserted(id) {
		index = getGameIndex(id);

		if(games.has(id) && index === -1) {
			index = 0;
		}

		if(index === -1) {
			throw new Error(`Cannot get game with id: "${id}"`);
		}

		cartridgeX.set(CARTRIDGE_SELECTION_THRESHOLD);
		cartridgeY.set(MAX_PROGRESS);

		this.show();
	},
};
