import { createMachine, assign, raise, enqueueActions } from "xstate";

import { gameloop } from "$game/shared/game-loop.machine.js";
import { invokeScene } from "$game/shared/scene.actor.js";
import { createJumper } from "./jumper.entity/jumper.entity.js";
import { invokeInput, invokeInputComponent } from "$game/shared/input.actor.js";
import { withScene, sceneAction } from "$game/shared/scene-action.js";
import { createPlatforms } from "./platforms.entity/platforms.entity.js";
import { createWorld } from "$game/shared/entity/world.entity.js";
import { createParticles } from "./particles.component.js";
import { createGeneration } from "./generation.entity/generation.entity.js";
import { createJumperCamera } from "./camera.component.js";
import { stateLogger } from "$util/state-logger.actor.js";
import { createCoins } from "./coins.entity/coins.entity.js";
import { createJumperUI } from "./ui/ui.entity.svelte.js";

import { inputTriggered } from "$game/util/input-guards.js";

import { BUTTON_START, BUTTON_A, BUTTON_B } from "$game/shared/input.consts.js";

import { EXIT } from "./ui/paused.consts.js";

import Menu from "./ui/menu.svelte";
import Paused from "./ui/paused.svelte";

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
					guard : inputTriggered,
					actions : raise({ type : "START_GAME" }),
				},

				[BUTTON_A] : {
					guard : inputTriggered,
					actions : raise({ type : "START_GAME" }),
				},

				START_GAME : "game",
			},
		},

		game : {
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
						createJumperUI,
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
			],

			on : {
				EXIT : {
					target : "menu",
				},
			},

			initial : "playing",

			states : {
				playing : {
					invoke : invokeInputComponent(
						"jumper-input",
						withScene(
							(scene) => scene.world.world.get("jumper").input,
						),
					),

					on : {
						[BUTTON_START] : {
							guard : inputTriggered,
							target : "pause",
						},
					},
				},

				pause : {
					entry : sceneAction((_, { world }) => {
						const ui = world.world.get("ui");

						ui.ui.openPauseMenu();
					}),

					exit : sceneAction((_, { world }) => {
						const ui = world.world.get("ui");

						ui.ui.closePauseMenu();
					}),

					meta : {
						load : withScene(({ world }) => {
							const ui = world.world.get("ui");

							return [
								Paused,
								{ model : ui.ui.getModel() },
							];
						}),
					},

					invoke : invokeInputComponent(
						"ui-input",
						withScene(
							(scene) => scene.world.world.get("ui").input,
						),
					),

					on : {
						[BUTTON_B] : {
							guard : inputTriggered,
							actions : raise({ type : "BACK_TO_PLAY" }),
						},

						[BUTTON_A] : {
							guard : inputTriggered,
							actions : raise({ type : "MENU_OPTION" }),
						},

						[BUTTON_START] : {
							guard : inputTriggered,
							actions : raise({ type : "MENU_OPTION" }),
						},

						BACK_TO_PLAY : {
							target : "playing",
						},

						MENU_OPTION : {
							actions : enqueueActions(
								sceneAction(({ enqueue }, { world }) => {
									const ui = world.world.get("ui");

									const option = ui.ui.getPausedOption();

									if(option === EXIT) {
										enqueue.raise({ type : "EXIT" });
										return;
									}

									enqueue.raise({ type : "BACK_TO_PLAY" });
								}),
							),
						},
					},
				},
			},
		},
	},
});
