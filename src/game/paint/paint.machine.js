import { createMachine, fromPromise, raise } from "xstate";

import { stateLogger } from "$util/state-logger.actor.js";

import { invokeScene } from "$game/shared/scene.actor.js";
import { invokeInput, invokeInputComponent } from "$game/shared/input.actor.js";
import { gameloop } from "$game/shared/game-loop.machine.js";
import { createCursor } from "./cursor.entity.js";
import { sceneAction, withScene } from "$game/shared/scene-action.js";
import { createWorld } from "$game/shared/entity/world.entity.js";
import { createPaintCamera } from "./camera.component.js";
import { createPaintUI } from "./ui/paint-ui.entity.svelte.js";
import { createSwirl } from "./ui/swirl.entity.js";

import Menu from "./ui/menu.svelte";
import Drawing from "./ui/drawing.svelte";
import {
	BUTTON_START,
	BUTTON_SELECT,
	BUTTON_A,
	BUTTON_B,
	invokePromptLayer,
	DPAD_FULL,
} from "$nissy-girl/prompts/prompts.svelte";

import { createArtboard } from "./artboard.entity.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "$nissy-girl/screens/screen.consts.js";

import { inputReleased, inputTriggered } from "$game/util/input-guards.js";
import { audio } from "$nissy-girl/sound/audio.js";
import { NEW_ARTBOARD } from "./ui/tools.consts.js";

export const paintMachine = createMachine({
	id : "paint",

	invoke : [
		gameloop,
		stateLogger,
	],

	initial : "loading",

	states : {
		loading : {
			type : "parallel",

			states : {
				screen : {
					initial : "pending",

					states : {
						pending : {
							on : {
								GAME_READY : "ready",
							},
						},

						ready : {
							type : "final",
						},
					},
				},

				preload : {
					initial : "pending",

					states : {
						pending : {
							invoke : {
								id : "load-sfx",
								src : fromPromise(audio.paint.load),
								onDone : "ready",
							},
						},

						ready : {
							type : "final",
						},
					},
				},
			},

			onDone : "menu",
		},

		menu : {
			invoke : [
				invokeScene({
					id : "titlescreen",
					entities : [
						createSwirl,
					],
					frameOrder : [
						"render",
					],
				}),
				invokeInput,

				invokePromptLayer(
					"paint-start",
					[[ BUTTON_START, { prompt : "paint" }]],
				),
			],

			meta : {
				component : Menu,
			},

			on : {
				[BUTTON_START] : {
					actions : raise({ type : "ENTER_ARTBOARD" }),
				},

				[BUTTON_A] : {
					actions : raise({ type : "ENTER_ARTBOARD" }),
				},

				ENTER_ARTBOARD : "artboard",
			},

			exit : () => audio.paint.playOink(),
		},

		artboard : {
			invoke : [
				invokeScene({
					id : "artboard",
					world : () => createWorld({
						width : CANVAS_WIDTH,
						height : CANVAS_HEIGHT,
						components : {
							camera : createPaintCamera,
						},
					}),
					entities : [
						createArtboard,
						createCursor,
						createPaintUI,
					],
					frameOrder : [
						"world",
						"input",
						"movement",
						"tool",
						"camera",
						"ui",
						"render",
					],
				}),
				invokeInput,
			],

			meta : {
				load : withScene((_, { world }) => {
					const ui = world.world.get("ui");

					return [
						Drawing,
						{ model : ui.ui.getModel() },
					];
				}),
			},

			initial : "drawing",

			states : {
				"drawing" : {
					exit : sceneAction((_, { world }) => {
						const cursor = world.world.get("cursor");

						cursor.tool.stop();
					}),

					invoke : [
						invokeInputComponent(
							"cursor-input",
							withScene(
								(_, { world }) => world.world.get("cursor").input,
							),
						),

						invokePromptLayer(
							"paint-drawing",
							withScene((_, { world }) => {
								const ui = world.world.get("ui");

								return [
									[ BUTTON_SELECT, { prompt : "zoom" }],
									[ BUTTON_START, { prompt : "menu" }],
									[ BUTTON_B, { prompt : "undo", disable : () => !ui.ui.getHasUndo() }],
									[ DPAD_FULL, {}],
									[ BUTTON_A, { prompt : () => `use ${ui.ui.getActiveTool()}` }],
								];
							}),
						),
					],

					on : {
						[BUTTON_START] : {
							guard : inputTriggered,
							target : "tool selection",
						},

						[BUTTON_SELECT] : {
							guard : inputTriggered,
							actions : sceneAction((_, { world }) => {
								const cameraIdx = world.camera.stepZoom();

								audio.paint.playWinnieZoom(cameraIdx);
							}),
						},

						[BUTTON_A] : [
							{
								guard : inputTriggered,
								actions : sceneAction((_, { world }) => {
									const cursor = world.world.get("cursor");

									cursor.tool.begin();
								}),
							},
							{
								guard : inputReleased,
								actions : sceneAction((_, { world }) => {
									const cursor = world.world.get("cursor");

									cursor.tool.stop();
								}),
							},
						],

						[BUTTON_B] : {
							guard : inputTriggered,
							actions : sceneAction((_, { world }) => {
								const artboard = world.world.get("artboard");

								const pixels = artboard.artboard.getContext();

								if(pixels.undo()) {
									audio.paint.playPop();
								}
							}),
						},
					},
				},

				"tool selection" : {
					invoke : [
						invokeInputComponent(
							"ui-input",
							withScene(
								(_, { world }) => world.world.get("ui").input,
							),
						),
					],

					on : {
						EXIT_TO_DRAWING : {
							actions : () => audio.paint.playGrunt(),
							target : "drawing",
						},

						CONFIRM_TO_DRAWING : {
							actions : () => audio.paint.playOinkConfirm(),
							target : "drawing",
						},
					},

					initial : "palette",

					states : {
						palette : {
							entry : sceneAction((_, { world }) => {
								const ui = world.world.get("ui");
								audio.paint.playGrunt();
								ui.ui.openPaletteMenu();
							}),

							invoke : invokePromptLayer(
								"paint-palette", [
									[ BUTTON_B, { prompt : "close" }],
									[ DPAD_FULL, {}],
									[ BUTTON_A, { prompt : "select" }],
									[ BUTTON_START, { prompt : "tools" }],
								],
							),

							on : {
								[BUTTON_B] : {
									guard : inputTriggered,
									actions : [
										sceneAction((_, { world }) => {
											const ui = world.world.get("ui");

											ui.ui.closePaletteMenu();
										}),
										raise({ type : "EXIT_TO_DRAWING" }),
									],
								},

								[BUTTON_A] : {
									guard : inputTriggered,
									actions : [
										sceneAction((_, { world }) => {
											const ui = world.world.get("ui");

											ui.ui.closePaletteMenu({ saveColor : true });
										}),
										raise({ type : "CONFIRM_TO_DRAWING" }),
									],
								},

								[BUTTON_START] : {
									guard : inputTriggered,
									actions : sceneAction((_, { world }) => {
										const ui = world.world.get("ui");

										ui.ui.closePaletteMenu({ saveColor : true });
									}),
									target : "tools",
								},
							},
						},

						tools : {
							entry : sceneAction((_, { world }) => {
								const ui = world.world.get("ui");
								audio.paint.playGrunt();
								ui.ui.openToolsMenu();
							}),

							exit : sceneAction((_, { world }) => {
								const ui = world.world.get("ui");

								ui.ui.closeToolsMenu();
							}),

							invoke : invokePromptLayer(
								"paint-tools",
								withScene((_, { world }) => {
									const ui = world.world.get("ui");

									return [
										[ BUTTON_B, { prompt : "close" }],
										[ DPAD_FULL, {}],
										[ BUTTON_A, {
											prompt : () => ui.ui.getNavTool() === NEW_ARTBOARD
												? "clear artboard"
												: "select",
										}],
									];
								}),
							),

							on : {
								[BUTTON_B] : {
									guard : inputTriggered,
									actions : raise({ type : "EXIT_TO_DRAWING" }),
								},

								[BUTTON_A] : {
									guard : inputTriggered,
									actions : [
										sceneAction((_, { world }) => {
											const ui = world.world.get("ui");

											ui.ui.selectTool();
										}),
										raise({ type : "CONFIRM_TO_DRAWING" }),
									],
								},

								[BUTTON_START] : {
									guard : inputTriggered,
									actions : raise({ type : "EXIT_TO_DRAWING" }),
								},
							},
						},
					},
				},
			},
		},
	},
});
