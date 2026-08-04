import {
	createMachine,
	fromCallback,
	assign,
	sendParent,
	raise,
} from "xstate";

import { rafLooper } from "$util/time.js";

import { screen } from "$nissy-girl/screens/screen.svelte";

import { stateLogger } from "$util/state-logger.actor.js";

// attaches to game machine and manages scene / raf loop / teardown / etc
export const gameloop = {
	id : "gameloop",
	systemId : "gameloop",
	src : createMachine({
		id : "gameloop",

		entry : sendParent({ type : "GAME_READY" }),

		context : () => ({
			loop : rafLooper((dt, { scene, input, parent }) => {
				let hasInput = false;

				if(scene) {
					if(scene.hasUpdate()) {
						scene.update(dt);
					}

					screen.render(scene.getRenderables());
				}

				if(input) {
					hasInput = input(dt);
				}

				const endFrameState = scene?.hasUpdate?.() || hasInput;

				if(!endFrameState) {
					parent.send({ type : "LOOP_PAUSE" });
				}

				return endFrameState;
			}),
			scene : false,
			input : false,
		}),

		invoke : [
			{
				id : "gameloop-lifecycle",
				src : fromCallback(({ context }) => {
					// machine exit lifecycle is more safely stored in an actor
					return () => {
						screen.clear();
						context.loop.stop();
					};
				}),
			},
			stateLogger,
		],

		on : {
			REGISTER_INPUT : {

			},

			REMOVE_INPUT : {

			},
		},

		type : "parallel",

		states : {
			scene : {
				initial : "none",

				states : {
					none : {
						on : {
							REGISTER_SCENE : {
								actions : assign(({ event }) => ({ scene : event.scene })),
								target : "active",
							},
						},
					},

					active : {
						on : {
							REMOVE_SCENE : {
								target : "none",
							},

							ENTITY_MESSAGE : {
								actions : ({ context, event }) =>
									context.scene.send(event.entityId, event.event),
							},
						},
					},
				},
			},

			input : {
				initial : "none",

				states : {
					none : {
						on : {
							REGISTER_INPUT : {
								actions : assign(({ event }) => ({ input : event.input })),
								target : "active",
							},
						},
					},

					active : {
						on : {
							REMOVE_INPUT : {
								// no teardown for input
								actions : assign({ input : false }),
								target : "none",
							},
						},
					},
				},
			},

			loop : {
				initial : "paused",

				states : {
					paused : {
						on : {
							START : "active",
						},
					},

					active : {
						entry : ({ context, self }) =>
							context.loop.start({
								parent : self,
								scene : context.scene,
								input : context.input,
							}),

						on : {
							// emitted by loop directly, match its state
							LOOP_PAUSE : "paused",

							REMOVE_SCENE : {
								actions : [
									({ context }) => {
										context.loop.stop();
										context.scene.stop();
										screen.clear();
									},
									assign({ scene : false }),
								],
								target : "paused",
							},

							REGISTER_INPUT : {
								actions : raise({ type : "UPDATE_SESSION" }),
							},
							REMOVE_INPUT : {
								actions : raise({ type : "UPDATE_SESSION" }),
							},

							UPDATE_SESSION : {
								actions : ({ context, self }) =>
									context.loop.updateSession({
										parent : self,
										scene : context.scene,
										input : context.input,
									}),
							},
						},
					},
				},
			},
		},
	}),
};
