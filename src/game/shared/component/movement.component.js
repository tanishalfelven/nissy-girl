import { createDirection } from "./direction.js";

/** @import { WorldEntity } from "$src/game/shared/entity/world.entity.js" */

const noopTrue = () => true;

export const createMovement = ({
	x : startX = 50,
	y : startY = 50,
	speed : inputSpeed = 1,
	canMoveTo = noopTrue,
}) => {
	// own position for the moment but likely pull out in the future
	let x = startX;
	let y = startY;
	let lastX = x;
	let lastY = y;

	let speed = inputSpeed;

	const dir = createDirection();

	return ({
		isMoving : dir.isMoving,

		hasUpdate : dir.isMoving,

		setDir : dir.set,

		setSpeed(newSpeed) {
			speed = newSpeed;
		},

		getSpeed() {
			return speed;
		},

		update(dt) {
			lastX = x;
			lastY = y;

			if(!dir.isMoving()) {
				return false;
			}

			const dirX = dir.getX();
			const dirY = dir.getY();

			const denom = Math.hypot(dirX, dirY);

			if(denom) {
				const newX = x + ((dirX / denom) * dt * speed);
				const newY = y + ((dirY / denom) * dt * speed);

				if(x !== newX && canMoveTo(newX, y)) {
					x = newX;
				}

				if(y !== newY && canMoveTo(x, newY)) {
					y = newY;
				}
			}

			return true;
		},

		setRoundedPosition() {
			x = Math.round(x);
			y = Math.round(y);
		},

		setX(newX) {
			x = newX;
		},

		setY(newY) {
			y = newY;
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

		getX() {
			return x;
		},

		getY() {
			return y;
		},
	});
};
