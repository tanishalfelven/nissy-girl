export const FPS60 = 1000 / 60;

const MAX_DT = 4;

export const calcDt = (prev, now) => {
	if(prev === false) {
		return 1;
	}

	const dt = Math.min((now - prev) / FPS60, MAX_DT);

	if(dt < 0) {
		return 0.001;
	}

	return dt;
};

export const msFromDt = (dt) => dt * FPS60;

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
	let previous = false;

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
		const dt = calcDt(previous, now);

		const run = func(dt, session);

		previous = now;

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
			previous = performance.now();
			id = requestAnimationFrame(loop);
		}
	};

	return {
		start,
		stop,
		updateSession(loopSession) {
			if(isActive) {
				session = loopSession;
			}
		},
		isActive() {
			return isActive;
		},
	};
};
