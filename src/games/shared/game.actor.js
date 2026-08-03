import { rafLooper } from "$util/time.js";

import { screenRuntime } from "$nissy-girl/screens/screen.actor.js";

import { createLazyActor } from "$util/create-lazy-actor.js";

export const gameActor = createLazyActor({
	id : "game",
	start(_started, { sendBack, receive }) {
		sendBack({ type : "GAME_READY" });

		let scene = false;

		const loop = rafLooper((dt) => {
			if(!scene) {
				return false;
			}

			if(scene.hasUpdate()) {
				scene.update(dt);
			}

			screenRuntime.send({ type : "RENDER_SCENE", renderables : scene.getRenderables() });

			return scene.hasUpdate();
		});

		receive((event) => {
			if(event.type === "REGISTER_SCENE" && event.scene) {
				if(scene) {
					throw new Error(`Attempted to register new scene "${event.scene.id}" while scene active {active:"${scene.id}"}`);
				}

				scene = event.scene;

				return;
			}

			if(event.type === "REMOVE_SCENE" && scene) {
				loop.stop();
				scene = false;

				screenRuntime.send({ type : "CLEAR_SCREEN" });

				return;
			}

			if(event.type === "START_SCENE" && scene) {
				loop.start();

				return;
			}
		});

		return () => {
			screenRuntime.send({ type : "CLEAR_SCREEN" });

			loop.stop();
		};
	},
});
