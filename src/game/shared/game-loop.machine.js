import {
	createMachine,
	fromCallback,
	assign,
	raise,
	sendParent,
} from "xstate";

import { rafLooper } from "$util/time.js";

import { screen } from "$nissy-girl/screens/screen.svelte";
import { stateLogger } from "$util/state-logger.actor.js";

import { GAME_TICK } from "./game.consts.js";

const MAX_SIMULATION_STEPS = 4;

// attaches to game machine and manages scene / raf loop / teardown / etc
export const gameloop = {
	id : "gameloop",
	systemId : "gameloop",
	src : createMachine({
		id : "gameloop",

		context : () => {
			let acc = 0;

			return ({
				loop : rafLooper((dt, { scene, input, parent }) => {
					acc = Math.min(acc + dt, MAX_SIMULATION_STEPS);

					let hasInput = false;

					if(input) {
						hasInput = input(dt);
					}

					if(scene) {
						let simulationSteps = 0;

						while(acc >= GAME_TICK && simulationSteps < MAX_SIMULATION_STEPS) {
							scene.simulate(GAME_TICK);

							acc -= GAME_TICK;
							simulationSteps++;
						}

						scene.frame(dt);

						screen.render(scene.world.world.getRenderable());
					}

					const endFrameState = scene?.hasUpdate?.() || hasInput;

					if(!endFrameState) {
						parent.send({ type : "LOOP_PAUSE" });
					}

					return endFrameState;
				}),
				scene : false,
				input : false,
			});
		},

		entry : sendParent({ type : "GAME_READY" }),

		invoke : [
			{
				id : "gameloop-lifecycle",
				src : fromCallback(({ context }) => {
					// machine exit lifecycle is more safely stored in an actor
					return () => {
						screen.clear();
						context?.loop?.stop?.();
						context?.scene?.destroy?.();
					};
				}),
			},
			stateLogger,
		],

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

				on : {
					REMOVE_SCENE : {
						actions : [
							({ context }) => {
								context.loop.stop();
								context.scene?.destroy?.();
								screen.clear();
							},
						],
						target : ".paused",
					},
				},

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
