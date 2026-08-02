export const FPS60 = 16.66;

export const rafThrottle = (func) => {
	let scheduled = false;
	let lastArgs;

	return (...args) => {
		lastArgs = args;

		if(scheduled) {
			return;
		};

		scheduled = true;
		requestAnimationFrame(() => {
			scheduled = false;
			func(...lastArgs);
		});
	};
};

export const rafLooper = (func) => {
	let id = false;
	let isActive = false;
	let prevTime = false;

	const stop = () => {
		if(id) {
			cancelAnimationFrame(id);

			id = false;
			isActive = false;
		}
	};

	const loop = (now) => {
		const dt = Math.min((now - prevTime) / FPS60, 4);

		const run = func(dt);

		prevTime = now;

		if(run) {
			id = requestAnimationFrame(loop);
		} else{
			stop();
		}
	};

	const start = () => {
		if(!id) {
			isActive = true;
			prevTime = performance.now();
			id = requestAnimationFrame(loop);
		}
	};

	return {
		start,
		stop,
		isActive() {
			return isActive;
		},
	};
};
