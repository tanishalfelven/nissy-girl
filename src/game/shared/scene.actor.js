import { fromObservable } from "xstate";

import { noopFalseFunction } from "$util/noop.js";

import { createScene } from "./entity/scene.entity.js";

export const invokeScene = ({
	id,
	world,
	entities,
	start = noopFalseFunction,
	stop = noopFalseFunction,
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

				observer.next(scene);
			});

			return {
				unsubscribe() {
					cancelled = true;

					if(gameloop.getSnapshot().status === "active") {
						gameloop.send({ type : "REMOVE_SCENE" });
					} else {
						scene.stop();
					}
				},
			};
		},
	})),
});
