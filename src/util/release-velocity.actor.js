import { fromCallback } from "xstate";

import { createVelocity } from "./velocity.js";
import { rafLooper } from "./time.js";

/** @import { Actor } from "xstate" */

export const ROTATE_VELOCITYID = "rotate-velocity";
export const VERT_VELOCITYID = "vert-velocity";

/**
 * Velocity actor consumes the following events and funnels back as a collected *_SWIPE event
 * including velocity outpus
 * - DRAG_START
 * - DRAG_END
 * - DRAG_DELTA
 * @param {string} id identifier
 * @param {string} eventName event name to fire into statechart
 * @returns {Actor} actor
 */
export const createReleaseVelocity = (id, eventName = "SWIPE") => ({
	id,
	src : fromCallback(({ sendBack, receive }) => {
		const velocity = createVelocity();

		let progress = false;

		const velocityLoop = rafLooper((dt) => {
			if(!progress) {
				return;
			}

			const movement = velocity.step(dt);

			const previous = progress.progress;

			const next = progress.project(movement);

			let executeMove = movement !== 0
				&& next !== previous;

			if(executeMove) {
				sendBack({ type : eventName, delta : movement });
			}

			if(progress?.isAnchor?.(next)) {
				velocity.stop();
			}

			return velocity.isMoving();
		});

		receive((event) => {
			if(event.type === "NEW_TARGET") {
				progress = event.progress;

				if(!progress) {
					velocity.stop();

					return;
				}

				velocity.init(progress.getVelocityConfig());

				return;
			}

			if(event.type === "DRAG_START" && progress) {
				velocityLoop.stop();

				return;
			}

			if(event.type === "DRAG_DELTA" && progress) {
				if(event.delta === 0) {
					return;
				}

				let delta = event.delta;

				if(progress.getEngageY()) {
					// X axis is always authoritative on the direction, add Y when configured to do so
					delta = Math.sign(event.delta) * (Math.abs(event.delta) + Math.abs(event.deltaY));
				}

				velocity.sample(delta);

				sendBack({ type : eventName, delta });

				return;
			}

			if(event.type === "DRAG_END" && progress) {
				velocityLoop.start();

				return;
			}
		});
	}),
});
