import { DPAD_DOWN, DPAD_LEFT, DPAD_RIGHT, DPAD_UP } from "$game/shared/input.consts.js";

import { input } from "$nissy-girl/input.js";

/** @import { WorldEntity } from "$src/game/shared/entity/world.entity.js" */

export const DIRECTION = new Map([
	[ DPAD_LEFT, -1 ],
	[ DPAD_RIGHT, 1 ],
	[ DPAD_UP, -1 ],
	[ DPAD_DOWN, 1 ],
]);

export const ALL_AXIS = [ DPAD_LEFT, DPAD_RIGHT, DPAD_UP, DPAD_DOWN ];
export const HORZ_AXIS = [ DPAD_LEFT, DPAD_RIGHT ];

export const createMovement = ({
	x : startX = 50,
	y : startY = 50,
	speed : inputSpeed = 1,
	axis = ALL_AXIS,
	canMoveTo = () => true,
}) => {
	// own position for the moment but likely pull out in the future
	let x = startX;
	let y = startY;
	let lastX = x;
	let lastY = y;

	let speed = inputSpeed;

	const moveDir = new Set();

	const isMoving = () => moveDir.size > 0;

	return ({
		isMoving() {
			return isMoving();
		},

		hasUpdate() {
			return isMoving();
		},

		setSpeed(newSpeed) {
			speed = newSpeed;
		},

		handleInput() {
			const dirCount = moveDir.size;

			for(const dir of axis) {
				if(input.state[dir]) {
					moveDir.add(dir);
				} else if(!input.state[dir]) {
					moveDir.delete(dir);
				}
			}

			const moveChange = moveDir.size !== dirCount
				|| isMoving();

			if(moveDir.size > 1) {
				// when a multi axis move starts/changes wipe the decimal
				// This makes diagonals not have staircase movements and makes pixel movement more predictable
				x = Math.round(x);
				y = Math.round(y);
			}

			return moveChange;
		},

		stopInput() {
			moveDir.clear();
		},

		update(dt) {
			lastX = x;
			lastY = y;

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

				if(x !== newX && canMoveTo(newX, y)) {
					x = newX;
				}

				if(y !== newY && canMoveTo(x, newY)) {
					y = newY;
				}
			}

			return true;
		},

		getLastX() {
			return lastX;
		},

		getLastY() {
			return lastY;
		},

		getPosition() {
			return { x, y };
		},

		getRoundedPosition() {
			return { x : Math.round(x), y : Math.round(y) };
		},

		getX() {
			return x;
		},

		getY() {
			return y;
		},

		setX(newX) {
			x = newX;
		},

		setY(newY) {
			y = newY;
		},
	});
};
