import { createMachine } from "xstate";

import { stateLogger } from "$util/state-logger.actor.js";

import { invokeScene } from "$game/shared/scene.actor.js";
import { invokeInput, invokeComponentInputListener } from "$game/shared/input.actor.js";
import { gameloop } from "$game/shared/game-loop.machine.js";
import { createCursor } from "./cursor.entity.js";
import { sceneAction, withScene } from "$game/shared/scene-action.js";
import { createWorld } from "$game/shared/entity/world.entity.js";
import { createCamera } from "$game/shared/component/camera.js";
import { createPainUIComponent } from "./ui/paint-ui.component.svelte.js";
import Toolbar from "./ui/toolbar.svelte";

import {
	BUTTON_A,
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
							ui : createPainUIComponent,
						},
					}),
					entities : [
						createArtboard,
						createCursor,
					],
					componentOrder : [
						"world",
						"movement",
						"camera",
						"tool",
						"ui",
						"render",
					],
				}),
				invokeInput,
			],

			meta : {
				load : withScene((scene) => [
					Toolbar,
					{ model : scene.world.ui.getModel() },
				]),
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
						// [BUTTON_START] : "tool selection",

						[BUTTON_START] : {
							actions : sceneAction((_, { world }) => {
								const artboard = world.world.get("artboard");
								const cursor = world.world.get("cursor");

								artboard.artboard.clear();
								cursor.tool.stop();
							}),
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
					},
				},

				"tool selection" : {

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
