import { fromCallback } from "xstate";
import { input } from "$nissy-girl/input.js";

import {
	DPAD_DOWN,
	DPAD_LEFT,
	DPAD_RIGHT,
	DPAD_UP,
	TRIGGERED,
	RELEASED,
} from "./input.consts.js";

import { FPS60 } from "$util/time.js";

const REPEAT_TIME = 45 / FPS60;

const REPEATING_INPUTS = new Set([
	DPAD_DOWN,
	DPAD_LEFT,
	DPAD_RIGHT,
	DPAD_UP,
]);

export const invokeInput = () => ({
	id : "input",
	src : fromCallback(({ sendBack, system }) => {
		const gameloop = system.get("gameloop");

		const isRepeating = new Set();

		let repeat = 0;

		gameloop.send({
			type : "REGISTER_INPUT",

			input : (dt) => {
				repeat += dt;

				if(repeat >= REPEAT_TIME) {
					repeat = 0;

					for(const input of isRepeating) {
						sendBack({ type : input, repeat : true });
					}
				}

				return isRepeating.size > 0;
			},
		});

		const removeInput = input.subscribe((event) => {
			// proxy triggered events back
			sendBack(event);

			if(REPEATING_INPUTS.has(event.type)) {
				if(event.state === RELEASED) {
					isRepeating.delete(event.type);
				} else if(event.state === TRIGGERED) {
					isRepeating.add(event.type);
				}
			}

			if(isRepeating.size > 0) {
				gameloop.send({ type : "START" });
			}
		});

		return () => {
			removeInput();

			if(gameloop.getSnapshot().status === "active") {
				gameloop.send({ type : "REMOVE_INPUT" });
			}
		};
	}),
});
