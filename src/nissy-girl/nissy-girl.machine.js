import {
	createMachine,
	createActor,
} from "xstate";

import { cameraService } from "./statechart-actors.svelte.js";
import { cameraMachine } from "./camera.machine.js";

const nissyGirlMachine = createMachine({
	id : "nissy-girl",

	invoke : {
		id : "camera",
		src : cameraMachine,
	},

	initial : "playing",

	states : {
		playing : {},
	},
});

const service = createActor(nissyGirlMachine);

const { unsubscribe } = service.subscribe((snapshot) => {
	if(snapshot.children.camera) {
		cameraService.set(snapshot.children.camera);

		unsubscribe();
	}
});

service.start();

export {
	service as nissyGirlMachine,
};
