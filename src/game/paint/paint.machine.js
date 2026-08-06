import { createMachine } from "xstate";

import { stateLogger } from "$util/state-logger.actor.js";

import { sendToEntity } from "$game/shared/sendto-entity.js";
import { invokeScene } from "$game/shared/scene.actor.js";
import { invokeInput } from "$game/shared/input.actor.js";
import { gameloop } from "$game/shared/game-loop.machine.js";
import { createCursor } from "./cursor.entity.js";

import {
	BUTTON_A,
	BUTTON_START,
	RELEASED,
} from "$game/shared/input.consts.js";

import { createArtboard } from "./artboard.entity.js";

export const paintMachine = createMachine({
	id : "paint",

	invoke : [
		gameloop,
		stateLogger,
	],

	initial : "loading",

	states : {
		loading : {
			on : {
				GAME_READY : "drawing",
			},
		},

		drawing : {
			invoke : [
				invokeScene({
					id : "drawing",
					entities : [
						createArtboard,
						createCursor,
					],
				}),
				invokeInput,
			],

			on : {
				[BUTTON_START] : {
					actions : sendToEntity("artboard", { type : "CLEAR" }),
				},
			},

			initial : "pen up",

			states : {
				"pen up" : {
					on : {
						[BUTTON_A] : {
							actions : sendToEntity("artboard", { type : "PEN_DOWN" }),
							target : "pen down",
						},
					},
				},

				"pen down" : {
					on : {
						[BUTTON_A] : [
							{
								guard : ({ event }) => event.state === RELEASED,
								actions : sendToEntity("artboard", { type : "PEN_UP" }),
								target : "pen up",
							},
						],
					},

					always : {
						actions : sendToEntity("artboard", { type : "PEN_DOWN" }),
					},
				},
			},
		},
	},
});
