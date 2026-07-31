import { crossedThresholdWrapInclusive } from "./math.js";

export const MIN_PROGRESS = 0;
export const MAX_PROGRESS = 1;

/** @import { VelocityConfig } from "./velocity.js" */

/**
 * @typedef {object} Progress
 * @property {number} progress current value
 * @property {() => VelocityConfig} getVelocityConfig get velocity config
 * @property {(delta: number) => number} update updates value in place and returns new progress value
 * @property {(delta: number) => number} project get projection of value given delta
 * @property {(value: number) => boolean} isAnchor if input is an anchor for progress value
 * @property {(value: number) => void} set sets progress value directly to value
 */

/**
 * @param {object} options options
 * @param {number} options.start start value
 * @param {number} options.speed speed step applied by velocity
 * @param {number[]} [options.anchors] stop points that velocity adheres to
 * @param {(cur: number, movement: number) => number} options.update pure value derivation func
 * @param {VelocityConfig} options.velocity velocity options
 * @returns {Progress} progress manager
 */
export const createProgress = ({
	start,
	speed,
	anchors : anchorInput = [],
	update : updateFunc,
	velocity,
}) => {
	if(start < 0 || start > 1) {
		throw new Error(`Cannot create progress with start value ${start}`);
	}

	const anchors = new Set(anchorInput);

	let _progress = $state(start);

	const calc = (delta) => {
		const val = updateFunc(_progress, delta * speed);

		for(const boundary of anchors) {
			if(boundary === _progress) {
				continue;
			}

			if(crossedThresholdWrapInclusive(_progress, val, boundary)) {
				return boundary;
			}
		}

		return val;
	};

	const progress = {
		get progress() {
			return _progress;
		},

		getVelocityConfig() {
			return velocity;
		},

		update(delta) {
			_progress = calc(delta);

			return _progress;
		},

		project(delta) {
			return calc(delta);
		},

		isAnchor(position) {
			return anchors.has(position);
		},

		set(value) {
			if(value < MIN_PROGRESS || value > MAX_PROGRESS) {
				throw new Error(`Cannot set progress to value ${value}`);
			}

			_progress = value;
		},
	};

	return progress;
};
