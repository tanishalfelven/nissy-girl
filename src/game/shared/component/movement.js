import { DPAD_DOWN, DPAD_LEFT, DPAD_RIGHT, DPAD_UP } from "$game/shared/input.consts.js";

import { input } from "$nissy-girl/input.js";

/** @import { WorldEntity } from "$src/game/shared/entity/world.entity.js" */

export const DIRECTION = new Map([
	[ DPAD_LEFT, -1 ],
	[ DPAD_RIGHT, 1 ],
	[ DPAD_UP, -1 ],
	[ DPAD_DOWN, 1 ],
]);

export const createMovement = ({
	x : startX = 50,
	y : startY = 50,
	speed = 1,
	camera,
}) => {
	// own position for the moment but likely pull out in the future
	let x = startX;
	let y = startY;

	const moveDir = new Set();

	const isMoving = () => moveDir.size > 0;

	return ({
		isMoving() {
			return isMoving();
		},

		hasUpdate() {
			return isMoving();
		},

		handleInput() {
			const dirCount = moveDir.size;

			for(const dir of DIRECTION.keys()) {
				if(input.state[dir]) {
					moveDir.add(dir);
				} else if(!input.state[dir]) {
					moveDir.delete(dir);
				}
			}

			const moveChange = moveDir.size !== dirCount
				|| isMoving();

			// when a move starts/changes wipe the decimal
			// This gets flatter movements and makes pixel movement more predictable
			if(moveChange) {
				x = Math.round(x);
				y = Math.round(y);
			}

			return moveChange;
		},

		stopInput() {
			moveDir.clear();
		},

		update(dt) {
			if(!isMoving()) {
				return false;
			}

			let dx = 0;
			let dy = 0;

			for(const dir of moveDir) {
				if(dir === DPAD_LEFT || dir === DPAD_RIGHT) {
					dx = DIRECTION.get(dir);
				}

				if(dir === DPAD_DOWN || dir === DPAD_UP) {
					dy = DIRECTION.get(dir);
				}
			}

			// normalize so diagonal is same speed
			const denom = Math.hypot(dx, dy);

			if(denom) {
				const newX = x + ((dx / denom) * dt * speed);
				const newY = y + ((dy / denom) * dt * speed);

				if(camera.inBounds(newX, y)) {
					x = newX;
				}

				if(camera.inBounds(x, newY)) {
					y = newY;
				}
			}

			return true;
		},

		getPosition() {
			return { x : Math.round(x), y : Math.round(y) };
		},

		getX() {
			return Math.round(x);
		},

		getY() {
			return Math.round(y);
		},
	});
};
