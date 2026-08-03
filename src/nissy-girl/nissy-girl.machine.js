import {
	createMachine,
	createActor,
	raise,
	sendTo,
} from "xstate";

import tracker from "xstate-state-tracker";

import { fromMachine } from "xstate-component-tree/from-machine";
import { ComponentTree } from "xstate-component-tree";

import { statechart } from "$util/statechart-actors.svelte.js";

import { cameraMachine } from "./camera.machine.js";
import StartupScreenComponent from "./screens/startup-screen.svelte";
import ErrorScreen from "./screens/error-screen.svelte";
import NissyGirlComponent from "./nissy-girl.svelte";
import { nissyGirl } from "./nissy-girl.viewmodel.svelte.js";
import { hasParam, getParam } from "$util/params.js";
import { screenRuntime } from "./screens/screen.actor.js";

const nissyGirlMachine = createMachine({
	id : "nissy-girl",

	meta : {
		component : NissyGirlComponent,
	},

	invoke : [
		{
			id : "camera",
			src : cameraMachine,
		},

		screenRuntime,
	],

	on : {
		HANDLE_GAME_PARAM : {
			guard : () => hasParam("game"),
			actions : () => nissyGirl.forceLoad(getParam("game")),
		},

		INSTANT_LOAD_GAME_READY : {
			target : ".poweredon.game",
		},
	},

	initial : "initializing",

	states : {
		initializing : {
			on : {
				RENDERER_READY : {
					target : "off",
					actions : raise({ type : "HANDLE_GAME_PARAM" }),
				},
			},
		},

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

				CARTRIDGE_ERROR : ".errant",
			},

			initial : "booting",

			states : {
				booting : {
					// TODO - eventually we go BACK to keyframes and have a scene / animation actor
					// replace component and draw directly
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
									guard : () => nissyGirl.hasInsertedCartridge(),
									target : "hasgame",
								},
							},
						},

						hasgame : {
							on : {
								CARTRIDGE_EJECTED : {
									actions : raise({ type : "CARTRIDGE_ERROR" }),
								},
							},

							after : {
								4000 : {
									guard : () => nissyGirl.hasInsertedCartridge(),
									actions : raise({ type : "START_GAME" }),
								},
							},
						},
					},
				},

				game : {
					invoke : {
						id : "game-machine",
						src : fromMachine(() => nissyGirl.getGame().machine),
					},

					on : {
						REGISTER_GAME : {
							actions : sendTo(
								"screen",
								({ event }) => ({
									type : "REGISTER_GAME",
									game : event.game,
								})),
						},

						CARTRIDGE_EJECTED : {
							actions : raise({ type : "CARTRIDGE_ERROR" }),
						},
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

const DEBUG_MACHINE = false;

if(DEBUG_MACHINE) {
	let game = false;

	tracker(service, (_machine, _state, last) => {
		/* eslint-disable-next-line no-console -- DEBUG ONLY WHAT DO U WANT FROM ME */
		console.log(`${_machine}:${JSON.stringify(_state)}`, last);

		if(!game && last?.children?.["game-machine"]) {
			game = true;

			tracker(last?.children?.["game-machine"], (machine, state) => {
				/* eslint-disable-next-line no-console -- DEBUG ONLY WHAT DO U WANT FROM ME */
				console.log(`${machine}:${JSON.stringify(state)}`, last);
			});
		}
	});
}

service.start();

export {
	service as nissyGirlMachine,
};
