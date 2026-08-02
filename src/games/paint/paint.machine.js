import { createMachine } from "xstate";

import Game from "../shared/game.svelte";

import { invokeGameActor } from "$games/shared/game.actor.js";

export const paintMachine = createMachine({
	id : "paint",

	invoke : [
		invokeGameActor(),
	],

	meta : {
		component : Game,
	},
});
