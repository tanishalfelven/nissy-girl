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

				CARTRIDGE_EJECTED : ".errant",
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

let game = false;

if(import.meta.env.DEV) {
	tracker(service, (_machine, _state, last) => {
		if(!game && last?.children?.["game-machine"]) {
			game = true;

			tracker(last?.children?.["game-machine"], (machine, state) => {
				console.log(`${machine}:${JSON.stringify(state)}`, last);
			});
		}
	});
}

service.start();

export {
	service as nissyGirlMachine,
};
