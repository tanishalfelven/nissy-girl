import { createMachine } from "xstate";

import { stateLogger } from "$util/state-logger.actor.js";

import { invokeScene } from "$game/shared/scene.actor.js";
import { invokeInput, invokeComponentInputListener } from "$game/shared/input.actor.js";
import { gameloop } from "$game/shared/game-loop.machine.js";
import { createCursor } from "./cursor.entity.js";
import { sceneAction, withScene } from "$game/shared/scene-action.js";
import { createWorld } from "$game/shared/entity/world.entity.js";
import { createCamera } from "$game/shared/component/camera.js";

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
				GAME_READY : "drawing",
			},
		},

		drawing : {
			invoke : [
				invokeScene({
					id : "drawing",
					world : () => createWorld({
						components : {
							camera : createCamera,
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
						"render",
					],
				}),
				invokeInput,

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
	},
});
