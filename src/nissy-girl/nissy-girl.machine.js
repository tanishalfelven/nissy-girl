import {
	createMachine,
	createActor,
	raise,
	sendTo,
	fromPromise,
} from "xstate";

import { fromMachine } from "xstate-component-tree/from-machine";
import { ComponentTree } from "xstate-component-tree";

import { statechart } from "$util/statechart-actors.svelte.js";
import { hasParam, getParam } from "$util/params.js";

import { cameraMachine } from "./camera.machine.js";
import StartupScreenComponent from "./screens/startup-screen.svelte";
import NissyGirlComponent from "./nissy-girl.svelte";
import { nissyGirl } from "./nissy-girl.viewmodel.svelte.js";
import { stateLogger } from "$util/state-logger.actor.js";
import { audio } from "./sound/audio.js";
import { invokePromptLayer, ROTATE, POWER_ON, POWER_OFF, MUSHROOM } from "./prompts/prompts.svelte";
import { gameOrder } from "$game/games.js";

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

		invokePromptLayer(
			"nissy-girl",
			[
				[ POWER_ON, { display : () => nissyGirl.hasInsertedCartridge() && !nissyGirl.isPowered }],
				[ ROTATE, { display : () => !nissyGirl.hasInsertedCartridge() || !nissyGirl.isPowered }],
			],
		),
	],

	on : {
		INSTANT_LOAD_GAME : {
			target : ".poweredon.game",
		},
	},

	initial : "initializing",

	states : {
		"initializing" : {
			invoke : {
				id : "load-audio",
				src : fromPromise(audio.loadNissyGirlSfx),
				onDone : [
					{
						guard : () => hasParam("game") && gameOrder.includes(getParam("game")),
						target : "wait-for-force-load-game",
					},
					{
						target : "off",
					},
				],
			},

		},

		"wait-for-force-load-game" : {
			entry : () => nissyGirl.forceLoad(getParam("game")),

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
			},

			initial : "booting",

			states : {
				booting : {
					on : {
						START_GAME : "game",
					},

					invoke : invokePromptLayer("booting", [[ MUSHROOM, {}]]),

					initial : "none",

					states : {
						none : {
							after : {
								500 : "display",
							},
						},

						display : {
							// TODO - eventually we go BACK to keyframes and have a scene / animation actor
							// replace component and draw directly
							meta : {
								component : StartupScreenComponent,
							},

							initial : "waitforgame",

							states : {
								// I *love* that we just get wedged here if theres no game in.
								// ux. be damned.
								waitforgame : {
									entry : raise({ type : "GAME_ON_BOOT" }),

									on : {
										GAME_ON_BOOT : [
											{
												guard : () => nissyGirl.hasInsertedCartridge(),
												target : "hasgame",
											},
											{
												target : "nogame",
											},
										],
									},
								},

								nogame : {
									invoke : invokePromptLayer(
										"nissy-girl",
										[
											[ ROTATE, { display : () => !nissyGirl.hasInsertedCartridge() }],
											// if the user is staring at a hanging screen, recommend a power cycle (I'm *so* nice`)
											[ POWER_OFF, { display : () => nissyGirl.hasInsertedCartridge(), prompt : "try rebooting?" }],
										],
									),
								},

								hasgame : {
									entry : async () => {
										const renderModule = await import("$nissy-girl/screens/render.js");

										// kick off render init for game but we don't need to wait for this here
										renderModule.initRenderer();
									},

									on : {
										CARTRIDGE_EJECTED : {
											actions : raise({ type : "POWER_TOGGLE" }),
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
					},
				},

				game : {
					invoke : {
						id : "game-machine",
						src : fromMachine(() => nissyGirl.getGame().machine()),
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
							actions : raise({ type : "POWER_TOGGLE" }),
						},
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
