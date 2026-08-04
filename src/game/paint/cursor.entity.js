import { TYPE_RGBA } from "$nissy-girl/screens/render.consts.js";

import moveUrl from "./assets/cursor-move.png";
import stationaryUrl from "./assets/cursor-stationary.png";

import { DPAD_DOWN, DPAD_LEFT, DPAD_RIGHT, DPAD_UP, RELEASED, TRIGGERED } from "$game/shared/input.consts.js";
import { FPS60 } from "$util/time.js";

const STEP_INTERVAL_MS = 30;

const DIRECTION = new Map([
	[ DPAD_LEFT, -1 ],
	[ DPAD_RIGHT, 1 ],
	[ DPAD_UP, -1 ],
	[ DPAD_DOWN, 1 ],
]);

/**
 * @returns {import("$game/shared/entity/scene.entity.js").Entity}
 */
export const createCursor = () => {
	let x = 50;
	let y = 50;

	let elapsedMs = 0;

	let sprites;

	let lastFrameSprite = false;

	const moveDir = new Set();

	return {
		id : "cursor",
		start() {},
		stop() {},
		send({ type, state }) {
			if(DIRECTION.has(type)) {
				if(state === TRIGGERED) {
					moveDir.add(type);
				} else if(state === RELEASED) {
					moveDir.delete(type);
				}

				return;
			}
		},
		hasUpdate() {
			return moveDir.size > 0;
		},
		update(dt) {
			let didUpdate = false;

			let dx = 0;
			let dy = 0;

			for(const dir of moveDir) {
				if(dir === DPAD_LEFT || dir === DPAD_RIGHT) {
					dx += DIRECTION.get(dir);
				}

				if(dir === DPAD_DOWN || dir === DPAD_UP) {
					dy += DIRECTION.get(dir);
				}
			}

			elapsedMs += dt * FPS60;

			while(elapsedMs >= STEP_INTERVAL_MS) {
				elapsedMs -= STEP_INTERVAL_MS;

				x += dx;
				y += dy;

				didUpdate = true;
			}

			return didUpdate;
		},
		getSpriteRequests() {
			return { move : moveUrl, stationary : stationaryUrl };
		},
		setSprites(resolvedSprites) {
			sprites = resolvedSprites;
		},
		getRenderable() {
			let currentFrameSprite = moveDir.size > 0 ? sprites.move : sprites.stationary;

			let dirty;

			if(currentFrameSprite !== lastFrameSprite) {
				lastFrameSprite = currentFrameSprite;

				dirty = {
					x : 0,
					y : 0,
					width : currentFrameSprite.getCurrentFrame().width,
					height : currentFrameSprite.getCurrentFrame().height,
				};
			}

			return {
				id : "cursor",
				// TODO this needs to be handled somewhere higher up
				x,
				y,
				type : TYPE_RGBA,
				imageData : currentFrameSprite.getCurrentFrame(),
				dirty,
			};
		},
	};
};
