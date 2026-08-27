import { fromObservable } from "xstate";

import { isActorAlive } from "$util/is-actor-alive.js";

import { createScene } from "./entity/scene.entity.js";

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
	src : fromObservable(({ system, input }) => ({
		subscribe(observer) {
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

			observer.next(scene);

			scene.load().then(() => {
				if(cancelled) {
					return;
				}

				gameloop.send({ type : "REGISTER_SCENE", scene });
			});

			return {
				unsubscribe() {
					cancelled = true;

					if(isActorAlive(gameloop)) {
						gameloop.send({ type : "REMOVE_SCENE" });
					}

					scene.destroy();
				},
			};
		},
	})),
});
