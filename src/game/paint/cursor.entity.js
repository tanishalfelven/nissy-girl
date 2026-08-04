import { DPAD_DOWN, DPAD_LEFT, DPAD_RIGHT, DPAD_UP, RELEASED, TRIGGERED } from "$game/shared/input.consts.js";

import { Sprite } from "pixi.js";

import moveUrl from "./assets/cursor-move.png";
import stationaryUrl from "./assets/cursor-stationary.png";

const SPEED = 0.5;

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

	const sprite = new Sprite();

	let textures;

	const moveDir = new Set();

	return {
		id : "cursor",
		getRenderable() {
			return sprite;
		},
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

			for(const dir of moveDir) {
				if(dir === DPAD_LEFT || dir === DPAD_RIGHT) {
					x += DIRECTION.get(dir) * dt * SPEED;

					didUpdate = true;
				}

				if(dir === DPAD_DOWN || dir === DPAD_UP) {
					y += DIRECTION.get(dir) * dt * SPEED;

					didUpdate = true;
				}
			}

			return didUpdate;
		},
		getPosition() {
			return {
				x : x + 2,
				y : y + 2,
			};
		},
		getTextureRequests() {
			return { move : moveUrl, stationary : stationaryUrl };
		},
		setTextures(loadedTextures) {
			textures = loadedTextures;

			sprite.texture = textures.stationary;
		},
		render() {
			sprite.texture = textures[moveDir.size > 0 ? "move" : "stationary"];

			sprite.x = Math.round(x);
			sprite.y = Math.round(y);

			return sprite;
		},
		destroy() {
			sprite.destroy();
		},
	};
};
