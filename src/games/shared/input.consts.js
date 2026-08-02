export const TRIGGERED = "triggered";
export const RELEASED = "released";
export const DPAD_DOWN = "dpad_down";
export const DPAD_LEFT = "dpad_left";
export const DPAD_RIGHT = "dpad_right";
export const DPAD_UP = "dpad_up";
export const BUTTON_B = "b";
export const BUTTON_A = "a";
export const BUTTON_START = "start";
export const BUTTON_SELECT = "select";

export const KEYBOARD_TO_INPUT = new Map([
	[ "w", DPAD_UP ],
	[ "a", DPAD_LEFT ],
	[ "s", DPAD_DOWN ],
	[ "d", DPAD_RIGHT ],

	[ "ArrowUp", DPAD_UP ],
	[ "ArrowLeft", DPAD_LEFT ],
	[ "ArrowDown", DPAD_DOWN ],
	[ "ArrowRight", DPAD_RIGHT ],

	[ " ", BUTTON_A ],
	[ "z", BUTTON_A ],
	[ "j", BUTTON_A ],
	[ "x", BUTTON_B ],
	[ "k", BUTTON_B ],
	[ "Enter", BUTTON_START ],
	[ "Shift", BUTTON_SELECT ],
]);
