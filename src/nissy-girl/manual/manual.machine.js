import { createMachine } from "xstate";

import { stateLogger } from "$util/state-logger.actor.js";

import { invokePromptLayer, ROTATE } from "$nissy-girl/prompts/prompts.svelte";
import { manual } from "./manual.viewmodel.svelte.js";
import { getAnimateProgress } from "$util/animate-progress.js";

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

		settling : {
			on : {
				DONE : {
					target : "viewing",
					actions : () => manual.clearDrag(),
				},
				DRAG_START : "curling",
			},

			invoke : {
				id : "settle-page",
				src : getAnimateProgress({
					duration : 800,
					steps : [ 1, 0 ],
					ease : (a) => a,
					progress : {
						set(value) {
							// TODO this is not actually linear
							manual.multiplyDrag(value);
						},
					},
				}),
			},
		},

		curling : {
			on : {
				// probably some sort of exit animation state here
				DRAG_END : "settling",

				DRAG_DELTA : {
					actions : ({ event }) => {
						manual.accumulateDrag(event.delta * 1.4, event.deltaY);
					},
				},
			},
		},
	},
});
