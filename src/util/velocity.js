import { FPS60 } from "./time.js";

const DEFAULT_SMOOTHING = 0.4;
const DEFAULT_DECAY = 0.9;
const DEFAULT_MIN = 0.00001;

/**
 * @typedef {object} VelocityConfig
 * @property {number} smoothing smoothing value
 * @property {number} decay friction/decay value
 * @property {number} min minimum value before stopping velocity updates
 */

/**
 * @typedef {object} Velocity
 * @property {number} value current velocity value
 * @property {() => boolean} isMoving in motion
 * @property {(config: VelocityConfig) => void} init hot-swap config and preserve current value
 * @property {(delta: number) => number} sample tracks time internally and samples from a given delta
 * @property {(dt: number) => number} step velocity forward over given delta time
 * @property {() => void} stop cancel velocity
 */

/**
 * @param {VelocityConfig} [options] initiate velocity with config
 * @returns {Velocity} velocity manager
 */
export const createVelocity = ({
	smoothing = DEFAULT_SMOOTHING,
	decay = DEFAULT_DECAY,
	min = DEFAULT_MIN,
} = false) => {
	let value = 0;
	let lastTime = false;

	return {
		get value() {
			return value;
		},

		isMoving() {
			return value !== 0;
		},

		init({
			smoothing : updateSmoothing = DEFAULT_SMOOTHING,
			decay : updateDecay = DEFAULT_DECAY,
			min : updateMin = DEFAULT_MIN,
		} = false) {
			smoothing = updateSmoothing;
			decay = updateDecay;
			min = updateMin;

			lastTime = false;
		},

		sample(delta) {
			const time = performance.now();

			if(lastTime !== false) {
				const dt = Math.max(time - lastTime, 4);
				const measured = delta * FPS60 / dt;

				value += (measured - value) * smoothing;
			}

			lastTime = time;

			return value;
		},

		step(dt) {
			value *= Math.pow(decay, dt);

			if(Math.abs(value) < min) {
				value = 0;
			}

			return value * dt;
		},

		stop() {
			value = 0;
			lastTime = false;
		},
	};
};
