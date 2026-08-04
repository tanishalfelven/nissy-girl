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

	let session = false;

	const stop = () => {
		if(id) {
			cancelAnimationFrame(id);

			session = false;
			id = false;
			isActive = false;
		}
	};

	const loop = (now) => {
		const dt = prevTime === false
			? 1
			: Math.min((now - prevTime) / FPS60, 4);

		const run = func(dt, session);

		prevTime = now;

		if(run) {
			id = requestAnimationFrame(loop);
		} else {
			stop();
		}
	};

	const start = (loopSession) => {
		if(!id) {
			isActive = true;
			session = loopSession;
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
