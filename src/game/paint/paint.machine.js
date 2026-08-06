import { createMachine } from "xstate";

import { stateLogger } from "$util/state-logger.actor.js";

import { invokeScene } from "$game/shared/scene.actor.js";
import { invokeInput } from "$game/shared/input.actor.js";
import { gameloop } from "$game/shared/game-loop.machine.js";
import { createCursor } from "./cursor.entity.js";
import { sceneAction } from "$game/shared/scene-action.js";

import {
	BUTTON_A,
	BUTTON_START,
	RELEASED,
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
					world : createArtboard,
					entities : [
						createCursor,
					],
				}),
				invokeInput,
			],

			on : {
				[BUTTON_START] : {
					actions : sceneAction(({ world }) => {
						world.artboard.clear();
						world.cursor.tool.stop();
					}),
				},
			},

			initial : "pen up",

			states : {
				"pen up" : {
					on : {
						[BUTTON_A] : {
							actions : sceneAction(({ world }) => world.cursor.tool.start()),
							target : "pen down",
						},
					},
				},

				"pen down" : {
					on : {
						[BUTTON_A] : [
							{
								guard : ({ event }) => event.state === RELEASED,
								actions : sceneAction(({ world }) => world.cursor.tool.stop()),
								target : "pen up",
							},
						],
					},

					// hold processes from input directional repeat
					always : {
						actions : sceneAction(({ world }) => world.cursor.tool.start()),
					},
				},
			},
		},
	},
});
