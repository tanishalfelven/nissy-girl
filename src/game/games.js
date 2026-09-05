import { GAME_PAINT_ID, GAME_JUMPER_ID } from "./games.consts.js";
import { paintMachine } from "./paint/paint.machine.js";
import { jumperMachine } from "./jumper/jumper.machine.js";

export const gameOrder = [
	GAME_PAINT_ID,
	GAME_JUMPER_ID,
];

export const games = new Map([
	[
		GAME_PAINT_ID,
		{
			id : GAME_PAINT_ID,
			machine : paintMachine,
		},
	],
	[
		GAME_JUMPER_ID,
		{
			id : GAME_JUMPER_ID,
			machine : jumperMachine,
		},
	],
]);

export const getGameIndex = (id) => {
	for(let i = 0; i < gameOrder.length; i++) {
		if(id === gameOrder[i]) {
			return i;
		}
	}

	return -1;
};
