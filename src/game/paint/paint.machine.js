import { createMachine } from "xstate";

import { gameActor } from "$game/shared/game.actor.js";
import { invokeScene } from "$game/shared/scene.actor.js";
import { invokeInput } from "$game/shared/input.actor.js";
import { sendToEntity } from "$game/shared/sendto-entity.js";

import { createArtboard } from "./artboard.entity.js";
import { createCursor } from "./cursor.entity.js";

export const paintMachine = createMachine({
	id : "paint",

	invoke : [
		gameActor,
	],

	entry : () => gameActor.initialize(true),

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
					entities : [
						createArtboard,
						createCursor,
					],
				}),

				invokeInput(),
			],

			on : {
				DPAD_LEFT : {
					actions : sendToEntity("cursor"),
				},
				DPAD_RIGHT : {
					actions : sendToEntity("cursor"),
				},
				DPAD_DOWN : {
					actions : sendToEntity("cursor"),
				},
				DPAD_UP : {
					actions : sendToEntity("cursor"),
				},
			},
		},
	},
});
