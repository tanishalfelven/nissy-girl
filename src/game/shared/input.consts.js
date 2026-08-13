export const TRIGGERED = "TRIGGERED";
export const RELEASED = "RELEASED";
export const PAUSED = "PAUSED";
export const DPAD_DOWN = "DPAD_DOWN";
export const DPAD_LEFT = "DPAD_LEFT";
export const DPAD_RIGHT = "DPAD_RIGHT";
export const DPAD_UP = "DPAD_UP";
export const BUTTON_B = "BUTTON_B";
export const BUTTON_A = "BUTTON_A";
export const BUTTON_START = "START";
export const BUTTON_SELECT = "SELECT";

export const KEYBOARD_TO_INPUT = new Map([
	[ "KeyW", DPAD_UP ],
	[ "KeyA", DPAD_LEFT ],
	[ "KeyS", DPAD_DOWN ],
	[ "KeyD", DPAD_RIGHT ],

	[ "ArrowUp", DPAD_UP ],
	[ "ArrowLeft", DPAD_LEFT ],
	[ "ArrowDown", DPAD_DOWN ],
	[ "ArrowRight", DPAD_RIGHT ],

	[ "Space", BUTTON_A ],
	[ "KeyZ", BUTTON_A ],
	[ "KeyJ", BUTTON_A ],
	[ "KeyX", BUTTON_B ],
	[ "KeyK", BUTTON_B ],
	[ "Enter", BUTTON_START ],
	[ "Shift", BUTTON_SELECT ],
]);
