import {
	createMachine,
	createActor,
	raise,
} from "xstate";

import tracker from "xstate-state-tracker";

import { fromMachine } from "xstate-component-tree/from-machine";
import { ComponentTree } from "xstate-component-tree";

import { cartridges } from "$cartridge/cartridge.viewmodel.svelte.js";
import { statechart } from "$util/statechart-actors.svelte.js";

import { cameraMachine } from "./camera.machine.js";
import StartupScreenComponent from "./screens/startup-screen.svelte";
import ErrorScreen from "./screens/error-screen.svelte";
import NissyGirlComponent from "./nissy-girl.svelte";
import { nissyGirl } from "./nissy-girl.viewmodel.svelte.js";

const nissyGirlMachine = createMachine({
	id : "nissy-girl",

	invoke : {
		id : "camera",
		src : cameraMachine,
	},

	meta : {
		component : NissyGirlComponent,
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

				CARTRIDGE_EJECTED : ".errant",
			},

			initial : "booting",

			states : {
				booting : {
					meta : {
						component : StartupScreenComponent,
					},

					on : {
						START_GAME : "game",
					},

					initial : "nogame",

					states : {
						// I *love* that we just get wedged here if theres no game in.
						// ux. be damned.
						nogame : {
							entry : raise({ type : "GAME_ON_BOOT" }),

							on : {
								GAME_ON_BOOT : {
									guard : () => nissyGirl.hasInsertedCartridge,
									target : "hasgame",
								},
							},
						},

						hasgame : {
							after : {
								4000 : {
									guard : () => nissyGirl.hasInsertedCartridge,
									actions : raise({ type : "START_GAME" }),
								},
							},
						},
					},
				},

				game : {
					invoke : {
						id : "game",
						src : fromMachine(() => cartridges.getCurrentCartridgeGame().machine),
					},
				},

				errant : {
					meta : {
						component : ErrorScreen,
					},
				},
			},
		},
	},
});

const service = createActor(nissyGirlMachine);

statechart.set(
	new ComponentTree(service, (tree) => {
		statechart.setTree(tree);
	}),
);

/* eslint-disable-next-line -- this is nice for dev, whatever for now */
tracker(service, (machine, state) => console.log(`${machine}:${JSON.stringify(state)}`));

service.start();

export {
	service as nissyGirlMachine,
};
