import { fromCallback } from "xstate";
import { rafLooper } from "./time.js";
import { lerp, wrap, roundDigit } from "./math.js";
import { cubicInOut } from "svelte/easing";

const identity = (a) => a;

export const getAnimateProgress = ({
	steps,
	modify = identity,
	duration = 1000,
	progress,
	ease = cubicInOut,
}) => {
	return fromCallback(({ sendBack }) => {
		steps = modify(steps);

		const startTime = performance.now();

		if(typeof steps === "function") {
			steps = steps();
		}

		const loop = rafLooper(() => {
			const remaining = performance.now() - startTime;
			const percent = remaining / duration;
			const segments = steps.length - 1;
			const percentIdx = percent * segments;

			const firstIdx = Math.floor(percentIdx);
			const nextIdx = firstIdx + 1;

			const firstVal = steps[firstIdx];
			const nextVal = steps[nextIdx];

			let animAmount =
				roundDigit(
					wrap(
						lerp(
							ease(percentIdx - firstIdx),
							firstVal,
							nextVal,
						),
						0,
						1,
					),
					5,
				);

			if(Number.isNaN(animAmount)) {
				sendBack({ type : "DONE" });
				return false;
			}

			progress.set(animAmount);

			return true;
		});

		loop.start();

		return () => {
			loop.stop();
		};
	});
};
