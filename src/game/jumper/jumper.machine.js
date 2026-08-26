import { createMachine, assign, raise } from "xstate";

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

import { BUTTON_START, BUTTON_A } from "$game/shared/input.consts.js";

import Menu from "./ui/menu.svelte";

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
				DONE : "menu",
			},
		},

		menu : {
			meta : {
				component : Menu,
			},

			invoke : invokeInput,

			on : {
				[BUTTON_START] : {
					actions : raise({ type : "START_GAME" }),
				},

				[BUTTON_A] : {
					actions : raise({ type : "START_GAME" }),
				},

				START_GAME : "play",
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
