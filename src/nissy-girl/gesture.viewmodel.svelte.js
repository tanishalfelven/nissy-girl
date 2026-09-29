let deviceFocused = $state(true);
let doAnimate = $state(false);

export const gesture = {
	get shouldAnimate() {
		return doAnimate;
	},

	get isDeviceFocused() {
		return deviceFocused;
	},

	enableAnimate() {
		doAnimate = true;
	},

	disableAnimate() {
		doAnimate = false;
	},

	focusManual() {
		deviceFocused = false;
	},

	focusDevice() {
		deviceFocused = true;
	},
};
