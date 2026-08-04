import { fromCallback } from "xstate";

import { noopFalseFunction } from "$util/noop.js";

import { createScene } from "./entity/scene.entity.js";

export const invokeScene = ({
	id,
	entities,
	start = noopFalseFunction,
	stop = noopFalseFunction,
}) => ({
	id,
	src : fromCallback(({ system }) => {
		let cancelled = false;

		const gameloop = system.get("gameloop");

		const scene = createScene({
			id,
			entities,
			start,
			stop,
		});

		scene.load().then(() => {
			if(cancelled) {
				return;
			}

			scene.start();

			gameloop.send({ type : "REGISTER_SCENE", scene });
			gameloop.send({ type : "START" });
		});

		return () => {
			cancelled = true;

			if(gameloop.getSnapshot().status === "active") {
				gameloop.send({ type : "REMOVE_SCENE" });
			} else {
				scene.stop();
			}
		};
	}),
});
