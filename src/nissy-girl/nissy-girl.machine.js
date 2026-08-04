import {
	createMachine,
	createActor,
	raise,
	sendTo,
} from "xstate";

import { fromMachine } from "xstate-component-tree/from-machine";
import { ComponentTree } from "xstate-component-tree";

import { statechart } from "$util/statechart-actors.svelte.js";
import { hasParam, getParam } from "$util/params.js";

import { cameraMachine } from "./camera.machine.js";
import StartupScreenComponent from "./screens/startup-screen.svelte";
import ErrorScreen from "./screens/error-screen.svelte";
import NissyGirlComponent from "./nissy-girl.svelte";
import { nissyGirl } from "./nissy-girl.viewmodel.svelte.js";
import { stateLogger } from "$util/state-logger.actor.js";

const nissyGirlMachine = createMachine({
	id : "nissy-girl",

	meta : {
		component : NissyGirlComponent,
	},

	invoke : [
		{
			id : "camera",
			systemId : "camera",
			src : cameraMachine,
		},
		stateLogger,
	],

	on : {
		INSTANT_LOAD_GAME : {
			target : ".poweredon.game",
		},
	},

	initial : "initializing",

	states : {
		"initializing" : {
			on : {
				RENDERER_READY : [
					{
						guard : () => hasParam("game"),
						actions : () => nissyGirl.forceLoad(getParam("game")),
						target : "wait-for-force-load-game",
					},
					{
						target : "off",
					},
				],
			},
		},

		"wait-for-force-load-game" : {
			on : {
				INSTANT_LOAD_GAME_READY : {
					actions : raise({ type : "INSTANT_LOAD_GAME" }),
				},
			},
		},

		"off" : {
			on : {
				POWER_TOGGLE : {
					target : "poweredon",
					actions : () => nissyGirl.togglePower(),
				},
			},
		},

		"poweredon" : {
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

const nissyGirlActor = createActor(nissyGirlMachine);

new ComponentTree(nissyGirlActor, (tree) => statechart.setTree(tree));

const cameraActor = nissyGirlActor.system.get("camera");

nissyGirlActor.start();

export {
	nissyGirlActor,
	cameraActor,
};
