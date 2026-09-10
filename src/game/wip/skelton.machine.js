import { createMachine } from "xstate";

import { stateLogger } from "$util/state-logger.actor.js";

import { invokeScene } from "$game/shared/scene.actor.js";
import { gameloop } from "$game/shared/game-loop.machine.js";

import { createCharacter } from "./character.entity.js";
import { invokeInput, invokeInputComponent } from "$game/shared/input.actor.js";
import { withScene } from "$game/shared/scene-action.js";

export const skeltonMachine = createMachine({
	id : "skelton",

	invoke : [
		gameloop,
		stateLogger,
	],

	initial : "loading",

	states : {
		loading : {
			on : {
				GAME_READY : "menu",
			},
		},

		menu : {
			invoke : [
				invokeScene({
					id : "test",
					entities : [
						createCharacter,
					],
					frameOrder : [
						"render",
					],
				}),
				invokeInput,
				invokeInputComponent(
					"character-input",
					withScene(
						(_, { world }) => world.world.get("character").input,
					),
				),
			],
		},
	},
});
