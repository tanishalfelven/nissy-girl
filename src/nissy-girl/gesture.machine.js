import { createMachine, createActor, sendTo } from "xstate";

import { ComponentTree } from "xstate-component-tree";

import { statechart } from "$util/statechart-actors.svelte.js";
import { stateLogger } from "$util/state-logger.actor.js";
import { getAnimateProgress } from "$util/animate-progress.js";

import { gesture } from "./gesture.viewmodel.svelte.js";
import CameraComponent from "./camera.svelte";
import { nissyGirlMachine } from "./device/nissy-girl.machine.js";
import { deviceCameraMachine } from "./device/device-camera.machine.js";
import { rotation } from "./device/device-camera.viewmodel.svelte.js";
import { manualMachine } from "./manual/manual.machine.js";

export const gestureMachine = createMachine({
	id : "gesture",

	meta : {
		component : CameraComponent,
	},

	invoke : [
		{
			id : "nissy-girl",
			systemId : "nissy-girl",
			src : nissyGirlMachine,
		},
		stateLogger,
	],

	on : {
		FOCUS_DEVICE : ".manual out",
		FOCUS_MANUAL : ".device camera out",
	},

	initial : "device camera",

	states : {
		"device camera" : {
			on : {
				// Wow this is obnoxious - but since device-camera doesn't always exist it's easier to route
				// here than export a sometimes-alive actor
				DRAG_START : {
					actions : sendTo("device-camera", { type : "DRAG_START" }),
				},

				DRAG_END : {
					actions : sendTo("device-camera", { type : "DRAG_END" }),
				},

				DRAG_DELTA : {
					actions : sendTo("device-camera", ({ event }) => event),
				},

				CART_DRAG_START : {
					actions : sendTo("device-camera", ({ event }) => event),
				},

				CART_XDRAG_START : {
					actions : sendTo("device-camera", ({ event }) => event),
				},

				CART_DRAG_DELTA : {
					actions : sendTo("device-camera", ({ event }) => event),
				},

				CART_XDRAG_DELTA : {
					actions : sendTo("device-camera", ({ event }) => event),
				},

				CART_DRAG_END : {
					actions : sendTo("device-camera", ({ event }) => event),
				},

				CART_XDRAG_END : {
					actions : sendTo("device-camera", ({ event }) => event),
				},

				REQUEST_MANUAL : {
					actions : sendTo("device-camera", { type : "REQUEST_MANUAL" }),
				},
			},

			invoke : [
				{
					id : "device-camera",
					systemId : "device-camera",
					src : deviceCameraMachine,
				},
			],

			initial : "lure",

			states : {
				lure : {
					invoke : {
						id : "rotation-lure",
						src : getAnimateProgress({
							duration : 4000,
							steps : [ 0, -0.2, 0.1, -0.05, 0.022, 0 ],
							// reverse direction each time we play
							modify : (steps) => steps.map((step) => -step),
							progress : rotation,
						}),
					},

					after : {
						6500 : {
							reenter : true,
							target : "lure",
						},
					},

					on : {
						DRAG_START : "interacting",
					},
				},

				interacting : {},
			},
		},

		"manual" : {
			on : {
				DRAG_START : {
					actions : sendTo("manual", { type : "DRAG_START" }),
				},

				DRAG_END : {
					actions : sendTo("manual", { type : "DRAG_END" }),
				},

				DRAG_DELTA : {
					actions : sendTo("manual", ({ event }) => event),
				},
			},

			invoke : [
				{
					id : "manual",
					systemId : "manual",
					src : manualMachine,
				},
			],
		},

		"device camera out" : {
			entry : () => {
				gesture.focusManual();
				gesture.enableAnimate();
			},
			exit : () => gesture.disableAnimate(),

			on : {
				// device camera state is irrelevant (it doesn't exist)
				REQUEST_MANUAL : "manual out",
			},

			after : {
				500 : "manual",
			},
		},

		"manual out" : {
			entry : () => {
				gesture.focusDevice();
				gesture.enableAnimate();
			},
			exit : () => gesture.disableAnimate(),

			after : {
				500 : "device camera.interacting",
			},
		},
	},
});

const gestureActor = createActor(gestureMachine);

new ComponentTree(gestureActor, (tree) => statechart.setTree(tree));

const nissyGirlActor = gestureActor.system.get("nissy-girl");

gestureActor.start();

export {
	gestureActor,
	nissyGirlActor,
};
