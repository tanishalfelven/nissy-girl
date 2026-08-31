import { FPS60 } from "$util/time.js";

export const createTemporalWindow = (maxTime) => {
	const MAX_TIME = maxTime / FPS60;

	let counter = 0;
	let running = false;

	const stop = () => {
		running = false;
		counter = 0;
	};

	return {
		start() {
			running = true;
			counter = MAX_TIME;
		},

		update(dt) {
			if(!running) {
				return false;
			}

			counter = Math.max(counter - dt, 0);

			if(counter === 0) {
				stop();

				return true;
			}

			return false;
		},

		stop,

		active() {
			return running && counter > 0;
		},
	};
};
