import PaintCartridgeArt from "./assets/paint-art.png";
import { GAME_PAINT_ID } from "./games.consts.js";
import { paintMachine } from "./paint/paint.machine.js";

export const gameOrder = [
	GAME_PAINT_ID,
];

export const games = new Map([
	[
		GAME_PAINT_ID,
		{
			id : GAME_PAINT_ID,
			cartridge : PaintCartridgeArt,
			machine : paintMachine,
		},
	],
]);
