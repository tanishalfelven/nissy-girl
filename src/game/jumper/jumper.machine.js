import { createMachine } from "xstate";

import { stateLogger } from "$util/state-logger.actor.js";

import { gameloop } from "$game/shared/game-loop.machine.js";
import { invokeScene } from "$game/shared/scene.actor.js";
import { createJumper } from "./jumper.entity.js";
import { invokeInput, invokeComponentInputListener } from "$game/shared/input.actor.js";
import { withScene } from "$game/shared/scene-action.js";

export const jumperMachine = createMachine({
	id : "jumper",

	invoke : [
		gameloop,
		stateLogger,
	],

	initial : "loading",

	states : {
		loading : {
			on : {
				GAME_READY : "play",
			},
		},

		play : {
			invoke : [
				invokeScene({
					id : "play",
					entities : [
						createJumper,
					],
					componentOrder : [
						"movement",
						"render",
					],
				}),
				invokeInput,
				invokeComponentInputListener(
					"jumper-movement",
					withScene(
						(scene) => scene.world.world.get("jumper").movement,
					),
				),
			],
		},
	},
});
