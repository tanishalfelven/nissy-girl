import {
	TRIGGERED,
	RELEASED,
	DPAD_DOWN,
	DPAD_LEFT,
	DPAD_RIGHT,
	DPAD_UP,
	BUTTON_B,
	BUTTON_A,
	BUTTON_START,
	BUTTON_SELECT,
	KEYBOARD_TO_INPUT,
} from "$game/shared/input.consts.js";

import { subscribers, domListenerSub } from "$util/listeners.js";

const state = {
	[DPAD_DOWN] : false,
	[DPAD_LEFT] : false,
	[DPAD_RIGHT] : false,
	[DPAD_UP] : false,
	[BUTTON_B] : false,
	[BUTTON_A] : false,
	[BUTTON_START] : false,
	[BUTTON_SELECT] : false,
};

const subs = subscribers();

const startKeyListeners = (fire) => {
	if(subs.has("keydown") || subs.has("keyup")) {
		return;
	}

	const handleKeyPress = (state) => (event) => {
		if(event.repeat) {
			return;
		}

		const hasInput = KEYBOARD_TO_INPUT.get(event.code) || KEYBOARD_TO_INPUT.get(event.key);

		if(hasInput) {
			event.preventDefault();

			fire({ type : hasInput, state });
		}
	};

	subs.add("keydown", domListenerSub(window, "keydown", handleKeyPress(TRIGGERED)));
	subs.add("keyup", domListenerSub(window, "keyup", handleKeyPress(RELEASED)));
	subs.add("blur", domListenerSub(window, "blur", () => {
		event.preventDefault();

		for(const input of Object.keys(state)) {
			fire({ type : input, state : RELEASED });
		}
	}));

	return () => subs.removeAll();
};

export const input = {
	subscribers : new Set(),

	_notify(event) {
		for(const subscriber of this.subscribers) {
			subscriber(event);
		}
	},

	subscribe(callback) {
		this.subscribers.add(callback);

		return () => this.subscribers.delete(callback);
	},

	fire(event) {
		if(state[event.type] === undefined) {
			/* eslint-disable-next-line no-console */
			console.warn(`Received unknown input event "${event.type}"`);

			return;
		}

		if(event.state !== TRIGGERED && event.state !== RELEASED) {
			/* eslint-disable-next-line no-console */
			console.warn(`Received unknown input state "${event.state}"`);

			return;
		}

		const triggerState = event.state === TRIGGERED;

		if(state[event.type] === triggerState) {
			return;
		}

		state[event.type] = triggerState;

		this._notify(event);
	},

	get state() {
		return state;
	},
};

startKeyListeners((event) => input.fire(event));
