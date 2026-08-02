import { fromCallback } from "xstate";

import { createRenderer } from "./render.js";

import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./game.consts.js";

import { input } from "$nissy-girl/input.svelte.js";

import { rafLooper } from "$util/time.js";

let isGame = false;
let registerCanvas = false;

export const invokeGameActor = ({
	width = CANVAS_WIDTH,
	height = CANVAS_HEIGHT,
} = false) => {
	if(isGame) {
		throw new Error("Cannot register new game actor, game in progress.");
	}

	let renderer;

	const loop = rafLooper(() => {
		if(!renderer) {
			/* eslint-disable-next-line no-console */
			console.warn("Entered game loop with no renderer, exiting.");

			return false;
		}

		renderer.render();

		return true;
	});

	return ({
		id : "game",
		src : fromCallback(({ sendBack, receive }) => {
			input.subscribe((_event) => {
				// do input stuff
			});

			registerCanvas = (canvas) => {
				renderer = createRenderer(canvas, { width, height });

				sendBack({ type : "READY" });
			};

			receive((event) => {
				if(event.type === "START_GAME") {
					if(!renderer) {
						/* eslint-disable-next-line no-console */
						console.warn("Tried to start game without a renderer!");

						return false;
					}

					loop.start();
				}
			});

			return () => {
				loop.stop();

				// release all module vars
				isGame = false;
				registerCanvas = false;
			};
		}),
	});
};

export const isGameReady = () => {
	return isGame;
};

export const registerCanvasToGame = (canvas) => {
	if(!registerCanvas) {
		return false;
	}

	registerCanvas(canvas);

	return true;
};
