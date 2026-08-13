import { fromCallback } from "xstate";
import { input } from "$nissy-girl/input.js";
import { isActorAlive } from "$util/is-actor-alive.js";

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

export const invokeInput = {
	systemId : "input",
	id : "input",
	src : fromCallback(({ sendBack, system, receive }) => {
		const gameloop = system.get("gameloop");

		const componentTargets = new Set();
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
			let triggersFrame = false;

			// proxy triggered events back
			sendBack(event);

			for(const component of componentTargets) {
				// component checks input directly, we handle next frame
				if(component.handleInput() !== false) {
					triggersFrame = true;
				}
			}

			if(REPEATING_INPUTS.has(event.type)) {
				if(event.state === RELEASED) {
					isRepeating.delete(event.type);
				} else if(event.state === TRIGGERED) {
					isRepeating.add(event.type);
				}
			}

			triggersFrame ||= isRepeating.size > 0;

			if(triggersFrame) {
				gameloop.send({ type : "START" });
			}
		});

		receive((event) => {
			if(event.type === "SEND_COMPONENT_INPUT") {
				if(!event.component.handleInput) {
					throw new Error("Attempted to register input for component with no handleInput");
				}

				componentTargets.add(event.component);

				return;
			}

			if(event.type === "REMOVE_COMPONENT_INPUT") {
				if(!event.component) {
					/* eslint-disable-next-line */
					console.warn("Tried to remove input for nonexistent target", event);

					return;
				}

				event.component?.stopInput?.();

				componentTargets.delete(event.component);

				return;
			}
		});

		return () => {
			// make sure everyone knows input has ended
			for(const repeating of isRepeating) {
				sendBack({ type : repeating, state : RELEASED });
			}

			removeInput();

			if(isActorAlive(gameloop)) {
				gameloop.send({ type : "REMOVE_INPUT" });
			}
		};
	}),
};

export const invokeComponentInputListener = (id, func) => ({
	id : `component-input-listener-${id}`,
	src : fromCallback((all) => {
		const { system } = all;

		const component = func(all);

		if(!component) {
			throw new Error("[invokeComponentInputListener] sent invalid component");
		}

		const input = system.get("input");

		input.send({ type : "SEND_COMPONENT_INPUT", component });

		return () => {
			if(isActorAlive(input)) {
				input.send({ type : "REMOVE_COMPONENT_INPUT", component });
			}
		};
	}),
});
