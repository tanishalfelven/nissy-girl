import { GAME_PAINT_ID, GAME_JUMPER_ID } from "./games.consts.js";

export const gameOrder = [
	GAME_PAINT_ID,
	GAME_JUMPER_ID,
];

export const games = new Map([
	[
		GAME_PAINT_ID,
		{
			id : GAME_PAINT_ID,
			machine : () => import("$game/paint/paint.machine.js").then(({ paintMachine }) => paintMachine),
		},
	],
	[
		GAME_JUMPER_ID,
		{
			id : GAME_JUMPER_ID,
			machine : () => import("$game/jumper/jumper.machine.js").then(({ jumperMachine }) => jumperMachine),
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
