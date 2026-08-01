import {
	createMachine,
	createActor,
} from "xstate";

import { nissyGirl } from "./nissy-girl.viewmodel.svelte.js";

import { cameraService } from "./statechart-actors.svelte.js";
import { cameraMachine } from "./camera.machine.js";

import tracker from "xstate-state-tracker";

const nissyGirlMachine = createMachine({
	id : "nissy-girl",

	invoke : {
		id : "camera",
		src : cameraMachine,
	},

	initial : "off",

	states : {
		off : {
			on : {
				POWER_TOGGLE : {
					target : "poweredon",
					actions : () => nissyGirl.togglePower(),
				},
			},
		},

		poweredon : {
			on : {
				POWER_TOGGLE : {
					actions : () => nissyGirl.togglePower(),
					target : "off",
				},
			},

			initial : "booting",

			states : {
				booting : {
					on : {
						BOOT_FINISH : "game",
					},
				},

				game : {},
			},
		},
	},
});

const service = createActor(nissyGirlMachine);

const { unsubscribe } = service.subscribe((snapshot) => {
	if(snapshot.children.camera) {
		cameraService.set(snapshot.children.camera);

		unsubscribe();
	}
});

tracker(service, (machine, state) => console.log(`${machine}:${JSON.stringify(state)}`));

service.start();

export {
	service as nissyGirlMachine,
};
