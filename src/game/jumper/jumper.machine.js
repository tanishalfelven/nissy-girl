import { createMachine } from "xstate";

import { stateLogger } from "$util/state-logger.actor.js";

import { gameloop } from "$game/shared/game-loop.machine.js";
import { invokeScene } from "$game/shared/scene.actor.js";
import { createJumper } from "./jumper.entity/jumper.entity.js";
import { invokeInput, invokeInputComponent } from "$game/shared/input.actor.js";
import { withScene } from "$game/shared/scene-action.js";
import { createPlatforms } from "./platforms.entity.js";

export const jumperMachine = createMachine({
	id : "jumper",

	invoke : [
		gameloop,
		stateLogger,
	],

	initial : "loading",

	states : {
		loading : {
			on : {
				GAME_READY : "play",
			},
		},

		play : {
			invoke : [
				invokeScene({
					id : "play",
					entities : [
						// entity ordering being decides component order as well
						createPlatforms,
						// player needs to be after walls so when player attemps to collide we have good positions
						createJumper,
					],
					simulateOrder : [
						// dynamic ordering comping in clutch here
						"world",
						"input",
						"movement",
						"physics",
						"behavior",
					],
					frameOrder : [
						"render",
					],
				}),
				invokeInput,
				invokeInputComponent(
					"jumper-input",
					withScene(
						(scene) => scene.world.world.get("jumper").input,
					),
				),
			],
		},
	},
});
