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

import { EXIT, START_OVER } from "./ui/paused.consts.js";

import Menu from "./ui/menu.svelte";
import Paused from "./ui/paused.svelte";
import PlayOverlay from "./ui/play-overlay/play-overlay.svelte";
import Countdown from "./ui/play-overlay/countdown.svelte";
import Score from "./ui/play-overlay/score.svelte";

export const jumperMachine = createMachine({
	id : "jumper",

	invoke : [
		gameloop,
		stateLogger,
	],

	context : {
		generation : false,
		selected : "daily",
	},

	on : {
		CACHE_GENERATION : {
			actions : assign({
				generation : ({ event }) => event.data,
			}),
		},

		RESTART : {
			target : ".restart",
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
					// force preload of ui by including in lifecycle
					createJumperUI,
				],
				simulateOrder : [
					"ui",
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

		restart : {
			after : {
				// ! xstate bug when using always with reenter true, this seems to force correct teardown
				1 : "game",
			},
		},

		game : {
			exit : withScene((_, { world }) => world.world.get("ui").ui.exitPlay()),

			meta : {
				load : withScene((_, { world }) => {
					const ui = world.world.get("ui");

					return [
						PlayOverlay,
						{ model : ui.ui.getModel() },
					];
				}),
			},

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
						"ui",
					],
				}),

				invokeInput,
			],

			on : {
				JUMPER_SUCCESS : {
					target : ".scoring",
				},

				EXIT : {
					target : "menu",
				},
			},

			initial : "playing",

			states : {
				playing : {
					on : {
						PAUSE : "pause",
					},

					initial : "countdown",

					states : {
						countdown : {
							meta : {
								load : withScene((_, { world }) => {
									const ui = world.world.get("ui");

									return [
										Countdown,
										{ model : ui.ui.getModel() },
									];
								}),
							},

							on : {
								START_PLAY : "active",
							},
						},

						active : {
							invoke : invokeInputComponent(
								"jumper-input",
								withScene(
									(_, { world }) => world.world.get("jumper").input,
								),
							),

							on : {
								[BUTTON_START] : {
									guard : inputTriggered,
									actions : raise({ type : "PAUSE" }),
								},
							},
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
						load : withScene((_, { world }) => {
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
							(_, { world }) => world.world.get("ui").input,
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
							target : "playing.active",
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

									if(option === START_OVER) {
										enqueue.raise({ type : "RESTART" });
										return;
									}

									enqueue.raise({ type : "BACK_TO_PLAY" });
								}),
							),
						},
					},
				},

				scoring : {
					entry : withScene((_, { world }) => world.world.get("ui").ui.stopPlay()),

					initial : "zooming",

					states : {
						zooming : {
							after : {
								2000 : "display",
							},
						},

						display : {
							meta : {
								load : withScene((_, { world }) => {
									const ui = world.world.get("ui");

									return [
										Score,
										{ model : ui.ui.getModel() },
									];
								}),
							},

							invoke : invokeInputComponent(
								"ui-input",
								withScene(
									(_, { world }) => world.world.get("ui").input,
								),
							),

							on : {
								[BUTTON_A] : {
									guard : inputTriggered,
									actions : raise({ type : "MENU_OPTION" }),
								},

								[BUTTON_START] : {
									guard : inputTriggered,
									actions : raise({ type : "MENU_OPTION" }),
								},

								MENU_OPTION : {
									actions : enqueueActions(
										sceneAction(({ enqueue }, { world }) => {
											const ui = world.world.get("ui");

											const option = ui.ui.getScoreOption();

											if(option === EXIT) {
												enqueue.raise({ type : "EXIT" });
												return;
											}

											enqueue.raise({ type : "RESTART" });
										}),
									),
								},
							},
						},
					},
				},
			},
		},
	},
});
