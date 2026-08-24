import { createMachine, assign } from "xstate";

import { gameloop } from "$game/shared/game-loop.machine.js";
import { invokeScene } from "$game/shared/scene.actor.js";
import { createJumper } from "./jumper.entity/jumper.entity.js";
import { invokeInput, invokeInputComponent } from "$game/shared/input.actor.js";
import { withScene } from "$game/shared/scene-action.js";
import { createPlatforms } from "./platforms.entity/platforms.entity.js";
import { createWorld } from "$game/shared/entity/world.entity.js";
import { createParticles } from "./particles.component.js";
import { createGeneration } from "./generation.entity/generation.entity.js";
import { createJumperCamera } from "./camera.component.js";
import { stateLogger } from "$util/state-logger.actor.js";
import { createCoins } from "./coins.entity/coins.entity.js";

export const jumperMachine = createMachine({
	id : "jumper",

	invoke : [
		gameloop,
		stateLogger,
	],

	context : {
		generation : false,
	},

	on : {
		CACHE_GENERATION : {
			actions : assign({
				generation : ({ event }) => event.data,
			}),
		},
	},

	initial : "waitforloop",

	states : {
		waitforloop : {
			on : {
				GAME_READY : "load",
			},
		},

		load : {
			invoke : invokeScene({
				id : "simulate",
				entities : [
					createGeneration,
				],
				simulateOrder : [
					"capabilities",
					"generator",
				],
			}),

			on : {
				DONE : "play",
			},
		},

		play : {
			invoke : [
				invokeScene({
					id : "play",
					world : () => createWorld({
						components : {
							camera : createJumperCamera,
							particles : createParticles,
						},
					}),
					entities : [
						// entity ordering being decides component order as well
						createPlatforms,
						createCoins,
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
						"coins",
					],
					frameOrder : [
						"camera",
						"render",
						"particles",
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
