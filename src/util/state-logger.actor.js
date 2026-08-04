import { fromCallback } from "xstate";

const toStateString = ({ machine, value }) => `${machine.config.id}:${JSON.stringify(value)}`;

export const stateLogger = {
	id : "state-logger",
	src : fromCallback(({ self }) => {
		if(import.meta.env.PROD) {
			return;
		}

		let prevState;

		const unsub = self._parent.subscribe((parent) => {
			const state = toStateString(parent);

			if(prevState === state) {
				return;
			}

			prevState = state;

			/* eslint-disable-next-line */
			console.log(`${parent.machine.config.id}:${JSON.stringify(parent.value)}`);
		});

		return unsub;
	}),
};
