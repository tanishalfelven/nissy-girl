let isPowered = $state(false);
let insertedCartridge = $state(false);

export const nissyGirl = {
	get isPowered() {
		return isPowered;
	},

	togglePower() {
		isPowered = !isPowered;
	},

	get hasInsertedCartridge() {
		return insertedCartridge;
	},

	insertCartridge() {
		insertedCartridge = true;
	},

	ejectCartridge() {
		insertedCartridge = false;
	},
};
