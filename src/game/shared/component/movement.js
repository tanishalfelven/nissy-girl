import { DPAD_DOWN, DPAD_LEFT, DPAD_RIGHT, DPAD_UP } from "$game/shared/input.consts.js";

import { input } from "$nissy-girl/input.js";

/** @import { WorldEntity } from "$src/game/shared/entity/world.entity.js" */

const DIRECTION = new Map([
	[ DPAD_LEFT, -1 ],
	[ DPAD_RIGHT, 1 ],
	[ DPAD_UP, -1 ],
	[ DPAD_DOWN, 1 ],
]);

export const createMovement = ({
	x : startX = 50,
	y : startY = 50,
	speed = 1,
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

			return moveDir.size !== dirCount
				|| isMoving();
		},

		stopInput() {
			moveDir.clear();
		},

		update(dt) {
			if(!isMoving()) {
				return false;
			}

			for(const dir of moveDir) {
				if(dir === DPAD_LEFT || dir === DPAD_RIGHT) {
					x += DIRECTION.get(dir) * dt * speed;
				}

				if(dir === DPAD_DOWN || dir === DPAD_UP) {
					y += DIRECTION.get(dir) * dt * speed;
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
