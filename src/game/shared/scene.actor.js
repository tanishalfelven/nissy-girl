import { fromObservable } from "xstate";

import { isActorAlive } from "$util/is-actor-alive.js";

import { createScene } from "./entity/scene.entity.js";

export const invokeScene = ({
	id,
	world,
	entities,
	componentOrder,
}) => ({
	systemId : "scene",
	id,
	src : fromObservable(({ system }) => ({
		subscribe(observer) {
			let cancelled = false;

			const gameloop = system.get("gameloop");

			const scene = createScene({
				id,
				world,
				entities,
				componentOrder,
			});

			observer.next(scene);

			scene.load().then(() => {
				if(cancelled) {
					return;
				}

				gameloop.send({ type : "REGISTER_SCENE", scene });
				gameloop.send({ type : "START" });
			});

			return {
				unsubscribe() {
					cancelled = true;

					if(isActorAlive(gameloop)) {
						gameloop.send({ type : "REMOVE_SCENE" });
					} else {
						scene.destroy();
					}
				},
			};
		},
	})),
});
