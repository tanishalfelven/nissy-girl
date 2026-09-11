import { FPS60 } from "$util/time.js";

export const createAnimation = ({
	id,
	duration,
	update : renderUpdate,
	apply,
	getSample,
	looping = false,
}) => {
	const maxTime = duration / FPS60;

	let elapsed = 0;
	let running = false;

	const getT = () => elapsed / maxTime;

	return {
		id,

		sample(t = getT()) {
			// awkward that this can side effect the internal pose
			// but nice that this pattern means it is safe, for now
			renderUpdate(t);

			return getSample();
		},

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
				if(!looping && elapsed) {
					this.reset();

					return false;
				}

				elapsed %= maxTime;
			}

			renderUpdate(getT());
			apply();

			return true;
		},
	};
};
