import { createMachine, raise } from "xstate";

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
	BUTTON_A,
	BUTTON_B,
	BUTTON_START,
	BUTTON_SELECT,
	RELEASED,
	TRIGGERED,
} from "$game/shared/input.consts.js";

import { createArtboard } from "./artboard.entity.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "$nissy-girl/screens/screen.consts.js";

import { inputTriggered } from "$game/util/input-guards.js";

export const paintMachine = createMachine({
	id : "paint",

	invoke : [
		gameloop,
		stateLogger,
	],

	initial : "loading",

	states : {
		loading : {
			on : {
				GAME_READY : "menu",
			},
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
					],

					on : {
						[BUTTON_START] : {
							guard : inputTriggered,
							target : "tool selection",
						},

						[BUTTON_SELECT] : {
							guard : inputTriggered,
							actions : sceneAction((_, { world }) => world.camera.stepZoom()),
						},

						[BUTTON_A] : {
							actions : sceneAction(({ event }, { world }) => {
								const cursor = world.world.get("cursor");

								if(event.state === RELEASED) {
									cursor.tool.stop();
								} else if(!cursor.tool.active && event.state === TRIGGERED) {
									cursor.tool.begin();
								}
							}),
						},

						[BUTTON_B] : {
							guard : inputTriggered,
							actions : sceneAction((_, { world }) => {
								const artboard = world.world.get("artboard");

								const pixels = artboard.artboard.getContext();

								pixels.undo();
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
						[BUTTON_B] : {
							guard : inputTriggered,
							actions : raise({ type : "BACK_TO_DRAWING" }),
						},

						BACK_TO_DRAWING : "drawing",
					},

					initial : "palette",

					states : {
						palette : {
							entry : sceneAction((_, { world }) => {
								const ui = world.world.get("ui");

								ui.ui.openPaletteMenu();
							}),

							exit : sceneAction((_, { world }) => {
								const ui = world.world.get("ui");

								ui.ui.closePaletteMenu();
							}),

							on : {
								[BUTTON_A] : {
									guard : inputTriggered,
									actions : raise({ type : "BACK_TO_DRAWING" }),
								},

								[BUTTON_START] : {
									guard : inputTriggered,
									target : "tools",
								},
							},
						},

						tools : {
							entry : sceneAction((_, { world }) => {
								const ui = world.world.get("ui");

								ui.ui.openToolsMenu();
							}),

							exit : sceneAction((_, { world }) => {
								const ui = world.world.get("ui");

								ui.ui.closeToolsMenu();
							}),

							on : {
								[BUTTON_A] : {
									guard : inputTriggered,
									actions : [
										sceneAction((_, { world }) => {
											const ui = world.world.get("ui");

											ui.ui.selectTool();
										}),
										raise({ type : "BACK_TO_DRAWING" }),
									],
								},

								[BUTTON_START] : {
									guard : inputTriggered,
									actions : raise({ type : "BACK_TO_DRAWING" }),
								},
							},
						},
					},
				},
			},
		},
	},
});
