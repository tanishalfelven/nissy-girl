import { fromCallback } from "xstate";

import { noopFalseFunction } from "$util/noop.js";

import { createScene } from "./entity/scene.entity.js";

import { gameActor } from "./game.actor.js";

export const invokeScene = ({
	id,
	entities,
	start = noopFalseFunction,
	stop = noopFalseFunction,
}) => ({
	id,
	src : fromCallback(({ sendBack }) => {
		let cancelled = false;

		const scene = createScene({
			id,
			entities,
			start,
			stop,
			sendToGameActor : (event) => gameActor.send(event),
			sendToGameMachine : (event) => sendBack(event),
		});

		scene.load().then(() => {
			if(cancelled) {
				return;
			}

			scene.start();
		});

		return () => {
			cancelled = true;

			if(scene) {
				scene.stop();
			}
		};
	}),
});
