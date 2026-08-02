import { games } from "$games/games.js";

let isPowered = $state(false);
let insertedCartridge = $state(false);

const game = $derived.by(() => {
	if(!games.has(insertedCartridge)) {
		return false;
	}

	return games.get(insertedCartridge);
});

export const nissyGirl = {
	get isPowered() {
		return isPowered;
	},

	get game() {
		return game;
	},

	togglePower() {
		isPowered = !isPowered;
	},

	hasInsertedCartridge() {
		return insertedCartridge !== false;
	},

	insertCartridge(id) {
		insertedCartridge = id;
	},

	ejectCartridge() {
		insertedCartridge = false;
	},
};
