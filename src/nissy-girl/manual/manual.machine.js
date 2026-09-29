import { createMachine } from "xstate";

import { stateLogger } from "$util/state-logger.actor.js";

import { invokePromptLayer, ROTATE } from "$nissy-girl/prompts/prompts.svelte";
import { manual } from "./manual.viewmodel.svelte.js";

export const manualMachine = createMachine({
	id : "manual",

	invoke : [
		stateLogger,

		invokePromptLayer(
			"manual",
			[
				[ ROTATE, {
					prompt : "swipe thru manual",
				}],
			],
		),
	],

	initial : "viewing",

	states : {
		viewing : {
			on : {
				DRAG_START : {
					target : "curling",
				},
			},
		},

		curling : {
			exit : () => manual.clearCurl(),

			on : {
				// probably some sort of exit animation state here
				DRAG_END : "viewing",

				DRAG_DELTA : {
					actions : ({ event }) => {
						console.log(event);
						manual.accumulateCurl(event.delta, event.deltaY);
					},
				},
			},
		},
	},
});
