import { fromCallback } from "xstate";
import { input } from "$nissy-girl/input.js";
import { isActorAlive } from "$util/is-actor-alive.js";

export const invokeInput = {
	systemId : "input",
	id : "input",
	src : fromCallback(({ sendBack, system, receive }) => {
		const gameloop = system.get("gameloop");

		const componentTargets = new Set();

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
			input.releaseAll();
			removeInput();

			if(isActorAlive(gameloop)) {
				gameloop.send({ type : "REMOVE_INPUT" });
			}
		};
	}),
};

export const invokeInputComponent = (id, func) => ({
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
