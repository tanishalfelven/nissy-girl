import { createMachine, raise } from "xstate";

import { stateLogger } from "$util/state-logger.actor.js";

import { invokeScene } from "$game/shared/scene.actor.js";
import { invokeInput, invokeComponentInputListener } from "$game/shared/input.actor.js";
import { gameloop } from "$game/shared/game-loop.machine.js";
import { createCursor } from "./cursor.entity.js";
import { sceneAction, withScene } from "$game/shared/scene-action.js";
import { createWorld } from "$game/shared/entity/world.entity.js";
import { createCamera } from "$game/shared/component/camera.js";
import { createPaintUI } from "./ui/paint-ui.entity.svelte.js";
import Toolbar from "./ui/toolbar.svelte";

import {
	BUTTON_A,
	BUTTON_B,
	BUTTON_START,
	BUTTON_SELECT,
	RELEASED,
	TRIGGERED,
} from "$game/shared/input.consts.js";

import { createArtboard } from "./artboard.entity.js";

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
				GAME_READY : "artboard",
			},
		},

		artboard : {
			invoke : [
				invokeScene({
					id : "artboard",
					world : () => createWorld({
						components : {
							camera : createCamera,
						},
					}),
					entities : [
						createArtboard,
						createCursor,
						createPaintUI,
					],
					componentOrder : [
						"world",
						"movement",
						"camera",
						"ui",
						"tool",
						"render",
					],
				}),
				invokeInput,
			],

			meta : {
				load : withScene(({ world }) => {
					const ui = world.world.get("ui");

					return [
						Toolbar,
						{ model : ui.ui.getModel() },
					];
				}),
			},

			initial : "drawing",

			states : {
				"drawing" : {
					invoke : [
						invokeComponentInputListener(
							"cursor-movement",
							withScene(
								// this is wild...
								(scene) => scene.world.world.get("cursor").movement,
							),
						),
					],

					on : {
						[BUTTON_START] : {
							guard : ({ event }) => event.state === TRIGGERED,
							target : "tool selection",
						},

						[BUTTON_SELECT] : {
							actions : sceneAction(({ event }, { world }) => {
								if(event.state === TRIGGERED) {
									world.camera.stepZoom();
								}
							}),
						},

						[BUTTON_A] : {
							actions : sceneAction(({ event }, { world }) => {
								const cursor = world.world.get("cursor");

								if(event.state === RELEASED) {
									cursor.tool.stop();
								} else if(!cursor.tool.active) {
									cursor.tool.begin();
								}
							}),
						},

						[BUTTON_B] : {
							actions : sceneAction(({ event }, { world }) => {
								const artboard = world.world.get("artboard");

								const pixels = artboard.artboard.getContext();

								if(event.state === RELEASED) {
									pixels.undo();
								}
							}),
						},
					},
				},

				"tool selection" : {
					invoke : [
						invokeComponentInputListener(
							"ui-movement",
							withScene(
								({ world }) => world.world.get("ui").movement,
							),
						),
					],

					on : {
						BACK_TO_DRAWING : "drawing",
					},

					initial : "palette",

					states : {
						palette : {
							entry : sceneAction((_, { world }) => {
								const ui = world.world.get("ui");

								ui.ui.openPaletteMenu();
								ui.movement.setActiveNav("palette");
							}),

							exit : sceneAction((_, { world }) => {
								const ui = world.world.get("ui");

								ui.ui.closePaletteMenu();
								ui.movement.clearActiveNav();
							}),

							on : {
								CLEAR_ACTION : {
									actions : sceneAction((_, { world }) => {
										const artboard = world.world.get("artboard");
										const cursor = world.world.get("cursor");

										artboard.artboard.clear();
										cursor.tool.stop();
									}),
								},

								[BUTTON_A] : {
									guard : ({ event }) => event.state === TRIGGERED,
									actions : raise({ type : "BACK_TO_DRAWING" }),
								},

								[BUTTON_START] : {
									guard : ({ event }) => event.state === TRIGGERED,
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
									guard : ({ event }) => event.state === TRIGGERED,
									actions : [
										sceneAction((_, { world }) => {
											const artboard = world.world.get("artboard");

											artboard.artboard.clear();
										}),
										raise({ type : "BACK_TO_DRAWING" }),
									],
								},

								[BUTTON_START] : {
									guard : ({ event }) => event.state === TRIGGERED,
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

/*
{
	actions : sceneAction((_, { world }) => {
		const artboard = world.world.get("artboard");
		const cursor = world.world.get("cursor");

		artboard.artboard.clear();
		cursor.tool.stop();
	}),
}
*/
