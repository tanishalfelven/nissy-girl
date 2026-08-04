import { rafLooper } from "$util/time.js";

import { screen } from "$nissy-girl/screens/screen.svelte";

import { createLazyActor } from "$util/create-lazy-actor.js";

export const gameActor = createLazyActor({
	id : "game",
	start(_started, { sendBack, receive }) {
		sendBack({ type : "GAME_READY" });

		let scene = false;
		let handleInput = false;

		const loop = rafLooper((dt) => {
			let hasInput = false;

			if(scene) {
				if(scene.hasUpdate()) {
					scene.update(dt);
				}

				screen.render(scene.getRenderables());
			}

			if(handleInput) {
				hasInput = handleInput(dt);
			}

			return scene.hasUpdate() || hasInput;
		});

		receive((event) => {
			if(event.type === "REGISTER_SCENE" && event.scene) {
				if(scene) {
					throw new Error(`Attempted to register new scene "${event.scene.id}" while scene active {active:"${scene.id}"}`);
				}

				scene = event.scene;

				return;
			}

			if(event.type === "REGISTER_INPUT" && event.handleInput) {
				// input handler just exists across states
				handleInput = event.handleInput;

				// it can request scenes but does not imply need of game loop
				// input must request every frame it wishes to sample

				return;
			}

			if(event.type === "REMOVE_INPUT") {
				handleInput = false;

				return;
			}

			if(event.type === "ENTITY_MESSAGE") {
				if(scene) {
					scene.send(event.entityId, event.event);
				}

				return;
			}

			if(event.type === "REQUEST_ITERATION") {
				loop.start();

				return;
			}

			if(event.type === "REMOVE_SCENE" && scene) {
				loop.stop();
				scene = false;

				screen.clear();

				return;
			}

			if(event.type === "START_SCENE" && scene) {
				loop.start();

				return;
			}
		});

		return () => {
			screen.clear();

			loop.stop();
		};
	},
});
