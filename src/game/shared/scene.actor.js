import { fromCallback } from "xstate";

import { isActorAlive } from "$util/is-actor-alive.js";

import { createScene } from "./entity/scene.entity.js";
import { setScene, clearScene } from "./scene-action.js";

export const invokeScene = ({
	id,
	world,
	entities,
	simulateOrder,
	frameOrder,
}) => ({
	systemId : "scene",
	id,
	input : ({ self, context }) => ({ notifyGame : self.send, context }),
	src : fromCallback(({ system, input }) => {
		let cancelled = false;
		const gameloop = system.get("gameloop");

		const scene = createScene({
			id,
			world,
			entities,
			simulateOrder,
			frameOrder,
			context : input.context,
			notifyGame : input.notifyGame,
		});

		setScene(scene);

		scene.load().then(() => {
			if(cancelled) {
				return;
			}

			gameloop.send({ type : "REGISTER_SCENE", scene });
		});

		return () => {
			cancelled = true;

			if(isActorAlive(gameloop)) {
				gameloop.send({ type : "REMOVE_SCENE" });
			}

			clearScene(scene);
			scene.destroy();
		};
	}),
});
