const FPS60 = 1000 / 60;

export const createAnimation = ({
	duration,
	update : renderUpdate,
}) => {
	const maxTime = duration / FPS60;

	let elapsed = 0;
	let running = false;

	return {
		active() {
			return running;
		},

		start() {
			running = true;
		},

		stop() {
			running = false;
		},

		reset() {
			elapsed = 0;
			running = false;
		},

		update(dt) {
			if(!running) {
				return false;
			}

			elapsed += dt;

			if(elapsed >= maxTime) {
				elapsed %= maxTime;
			}

			renderUpdate(elapsed / maxTime);

			return true;
		},
	};
};
