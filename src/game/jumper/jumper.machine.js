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
import { createSeedUI } from "./ui/seed.entity.svelte.js";
import { audio } from "$nissy-girl/sound/audio.js";
import {
	invokePromptLayer,
	BUTTON_START,
	BUTTON_A,
	BUTTON_B,
	DPAD_DOWN,
	DPAD_VERT,
	DPAD_HORZ,
} from "$nissy-girl/prompts/prompts.svelte";

import { inputTriggered } from "$game/util/input-guards.js";

import { EXIT, START_OVER } from "./ui/paused.consts.js";

import Menu from "./ui/menu.svelte";
import MainMenu from "./ui/main.svelte";
import Paused from "./ui/paused.svelte";
import PlayOverlay from "./ui/play-overlay/play-overlay.svelte";
import Countdown from "./ui/play-overlay/countdown.svelte";
import Score from "./ui/play-overlay/score.svelte";
import SeedSelect from "./ui/seed-select.svelte";

import { MAP_ID_DAILY, MAP_ID_SEED } from "./generation.entity/generation.consts.js";
import { DAILY_TRIAL, SEED_OPTION } from "./ui/main.consts.js";

const withModel = (component) => withScene((_, { world }) => {
	const ui = world.world.get("ui");

	return [
		component,
		{ model : ui.ui.getModel() },
	];
});

export const jumperMachine = createMachine({
	id : "jumper",

	invoke : [
		gameloop,
		stateLogger,
	],

	context : {
		generation : false,
		selected : MAP_ID_DAILY,
		seed : false,
	},

	on : {
		CACHE_GENERATION : {
			actions : assign({
				generation : ({ event }) => event.data,
			}),
		},

		RESTART : {
			actions : () => audio.jumper.playUIConfirm(),
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
			initial : "main",

			meta : {
				load : withModel(Menu),
			},

			on : {
				GENERATE : "generate",
			},

			states : {
				main : {
					exit : [
						withScene((_, { world }) => {
							const ui = world.world.get("ui");

							ui.ui.closeMainMenu();
						}),
						assign({
							selected : withScene((_, { world }) => {
								const ui = world.world.get("ui");

								const selectedOption = ui.ui.getMenuOption();

								if(selectedOption === DAILY_TRIAL) {
									return MAP_ID_DAILY;
								}

								return MAP_ID_SEED;
							}),
						}),
					],

					meta : {
						load : withModel(MainMenu),
					},

					invoke : [
						invokeScene({
							id : "mainmenu",
							entities : [
								createJumperUI,
							],
							simulateOrder : [
								"world",
								"input",
								"movement",
							],
							frameOrder : [
								"ui",
							],
						}),

						invokeInput,
						invokeInputComponent(
							"ui-input",
							withScene(
								(_, scene) => {
									const ui = scene.world.world.get("ui");

									// ! This is getting awkward - entry actions are proving to be too fast for
									// ! scene contstruction and may get old cached data - invokes are becoming the correct
									// ! home for this kind of lifecycle
									ui.ui.openMainMenu();

									return ui.input;
								},
							),
						),

						invokePromptLayer("jumper-mainmenu", [
							[ DPAD_VERT, {}],
							[ BUTTON_A, { prompt : "select" }],
						]),
					],

					on : {
						[BUTTON_A] : {
							guard : inputTriggered,
							actions : raise({ type : "SELECT_OPTION" }),
						},

						SELECT_OPTION : [
							{
								guard : withScene((_, { world }) => {
									const ui = world.world.get("ui");

									return ui.ui.getMenuOption() === SEED_OPTION;
								}),
								target : "seed",
								actions : () => audio.jumper.playUIConfirm(),
							},
							{
								actions : [
									assign({
										seed : false,
									}),
									raise({ type : "GENERATE" }),
								],
							},
						],
					},
				},

				seed : {
					meta : {
						load : withModel(SeedSelect),
					},

					invoke : [
						invokeScene({
							id : "seed",
							entities : [
								createSeedUI,
							],
							simulateOrder : [
								"world",
								"input",
								"movement",
							],
							frameOrder : [
								"ui",
							],
						}),

						invokeInput,
						invokeInputComponent(
							"ui-input",
							withScene(
								(_, scene) => scene.world.world.get("ui").input,
							),
						),

						invokePromptLayer("jumper-seed select", [
							[ DPAD_HORZ, { prompt : "" }],
							[ DPAD_VERT, { prompt : "input seed" }],
							[ BUTTON_A, { prompt : "start" }],
						]),
					],

					on : {
						[BUTTON_B] : {
							guard : inputTriggered,
							actions : () => audio.jumper.playUIBack(),
							target : "main",
						},

						[BUTTON_START] : {
							guard : inputTriggered,
							actions : raise({ type : "SELECT_SEED" }),
						},

						[BUTTON_A] : {
							guard : inputTriggered,
							actions : raise({ type : "SELECT_SEED" }),
						},

						SELECT_SEED : {
							actions : [
								assign({
									seed : withScene((_, { world }) => {
										const ui = world.world.get("ui");

										return ui.ui.getSeed();
									}),
								}),
								raise({ type : "GENERATE" }),
							],
						},
					},
				},
			},
		},

		generate : {
			invoke : invokeScene({
				id : "generate",
				entities : [
					createGeneration,
				],
				simulateOrder : [
					"generator",
				],
			}),

			on : {
				DONE : "game",
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
				load : withModel(PlayOverlay),
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

				invokeInputComponent(
					"ui-input",
					withScene(
						(_, { world }) => world.world.get("ui").input,
					),
				),

				invokePromptLayer(
					"jumper-playing",
					withScene(
						(_, { world }) => {
							const jumper = world.world.get("jumper");

							return [
								[ BUTTON_START, { prompt : "menu" }],
								[ DPAD_HORZ, { prompt : "shmoove" }],
								[ DPAD_DOWN, {
									prompt : "crouch",
									disable : () => !jumper.behavior.runeIsGrounded(),
								}],
								[ BUTTON_A, {
									prompt : () => jumper.behavior.runeIsCrouching() ? "blast" : "jump",
									disable : () => jumper.behavior.runeIsFalling(),
								}],
							];
						},
					),
				),
			],

			on : {
				JUMPER_SUCCESS : {
					target : ".scoring",
				},

				EXIT : {
					actions : () => audio.jumper.playUIBack(),
					target : "menu",
				},
			},

			initial : "playing",

			states : {
				playing : {
					on : {
						PAUSE : "pause",
					},

					initial : "pregame",

					states : {
						pregame : {
							entry : () => audio.jumper.playUIConfirm(),

							after : {
								100 : "countdown",
							},
						},

						countdown : {
							meta : {
								load : withModel(Countdown),
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

						audio.jumper.playUIPause(),

						ui.ui.openPauseMenu();
					}),

					exit : sceneAction((_, { world }) => {
						const ui = world.world.get("ui");

						audio.jumper.playUIBack(),

						ui.ui.closePauseMenu();
					}),

					meta : {
						load : withModel(Paused),
					},

					invoke : [
						invokeInputComponent(
							"ui-input",
							withScene(
								(_, { world }) => world.world.get("ui").input,
							),
						),

						invokePromptLayer(
							"jumper-pause",
							[
								[ BUTTON_B, { prompt : "close" }],
								[ BUTTON_A, { prompt : "select" }],
							],
						),
					],

					on : {
						[BUTTON_B] : {
							guard : inputTriggered,
							actions : raise({ type : "BACK_TO_PLAY" }),
						},

						[BUTTON_START] : {
							guard : inputTriggered,
							actions : raise({ type : "BACK_TO_PLAY" }),
						},

						BACK_TO_PLAY : {
							target : "playing.active",
						},

						[BUTTON_A] : {
							guard : inputTriggered,
							actions : raise({ type : "MENU_OPTION" }),
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
					entry : withScene((_, { world }) => {
						audio.jumper.playWin();
						world.world.get("ui").ui.stopPlay();
					}),

					initial : "zooming",

					states : {
						zooming : {
							after : {
								2000 : "display",
							},
						},

						display : {
							meta : {
								load : withModel(Score),
							},

							invoke : [
								invokeInputComponent(
									"ui-input",
									withScene(
										(_, { world }) => world.world.get("ui").input,
									),
								),
								invokePromptLayer(
									"jumper-scoring",
									[
										[ BUTTON_START, { prompt : "exit" }],
										[ BUTTON_A, { prompt : "select" }],
									],
								),
							],

							on : {
								[BUTTON_A] : {
									guard : inputTriggered,
									actions : raise({ type : "MENU_OPTION" }),
								},

								[BUTTON_START] : {
									guard : inputTriggered,
									actions : raise({ type : "EXIT" }),
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
