import { createMachine, createActor, sendTo } from "xstate";

import { ComponentTree } from "xstate-component-tree";
import { statechart } from "$util/statechart-actors.svelte.js";

import CameraComponent from "./camera.svelte";
import { deviceCameraMachine } from "./device-camera.machine.js";
import { nissyGirlMachine } from "./nissy-girl.machine.js";
import { stateLogger } from "$util/state-logger.actor.js";

export const gestureMachine = createMachine({
	id : "gesture",

	meta : {
		component : CameraComponent,
	},

	invoke : [
		{
			id : "device-camera",
			systemId : "device-camera",
			src : deviceCameraMachine,
		},
		{
			id : "nissy-girl",
			systemId : "nissy-girl",
			src : nissyGirlMachine,
		},
		stateLogger,
	],

	initial : "device camera",

	states : {
		"device camera" : {
			on : {
				DRAG_START : {
					actions : sendTo("device-camera", { type : "DRAG_START" }),
				},

				DRAG_END : {
					actions : sendTo("device-camera", { type : "DRAG_END" }),
				},

				DRAG_DELTA : {
					actions : sendTo("device-camera", ({ event }) => event),
				},
			},
		},
	},
});

const gestureActor = createActor(gestureMachine);

new ComponentTree(gestureActor, (tree) => statechart.setTree(tree));

const deviceCameraActor = gestureActor.system.get("device-camera");
const nissyGirlActor = gestureActor.system.get("nissy-girl");

gestureActor.start();

export {
	gestureActor,
	deviceCameraActor,
	nissyGirlActor,
};
