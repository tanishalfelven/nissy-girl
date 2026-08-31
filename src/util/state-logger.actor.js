import { fromCallback } from "xstate";
import { track } from "./analytics.js";

const machineToId = ({ machine }) => machine.config.id;
const toState = ({ value }) => JSON.stringify(value);

export const stateLogger = {
	id : "state-logger",
	input : { analytics : true },
	src : fromCallback(({ self, input }) => {
		let prevState;

		const unsub = self._parent.subscribe((parent) => {
			const machineId = machineToId(parent);
			const state = toState(parent);

			if(prevState === state) {
				return;
			}

			prevState = state;

			if(import.meta.env.PROD) {
				if(input.analytics) {
					track(machineId, { state });
				}
			} else {
				/* eslint-disable-next-line */
				console.log(`${machineId}:${state}`);
			}
		});

		return unsub;
	}),
};
