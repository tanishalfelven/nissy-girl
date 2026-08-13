import { clamp } from "$util/math.js";

let volume = $state(0.65);

const volumeView = {
	get value() {
		return volume;
	},

	set(newVolume) {
		volume = clamp(newVolume, 0, 1);
	},

	getGain() {
		return volume ** 2;
	},
};

export { volumeView as volume };
