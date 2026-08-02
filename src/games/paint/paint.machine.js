import { createMachine } from "xstate";

import { gameActor } from "$games/shared/game.actor.js";

import { invokeScene } from "$games/shared/scene.actor.js";

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
			invoke : invokeScene({
				id : "drawing",
				entities : [],
			}),
		},
	},
});
