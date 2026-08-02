import { games } from "$games/games.js";
import { cartridges } from "./cartridge/cartridge.viewmodel.svelte.js";
import { nissyGirlMachine } from "./nissy-girl.machine.js";

let isPowered = $state(false);
let insertedCartridge = $state(false);

export const nissyGirl = {
	get isPowered() {
		return isPowered;
	},

	getGame() {
		if(!games.has(insertedCartridge)) {
			return false;
		}

		return games.get(insertedCartridge);
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

	forceLoad(id) {
		isPowered = true;

		this.insertCartridge(id);

		cartridges.setInserted(id);

		nissyGirlMachine.send({ type : "INSTANT_LOAD_GAME_READY" });
	},

	ejectCartridge() {
		insertedCartridge = false;
	},
};
