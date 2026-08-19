import { createVelocity } from "$util/velocity.js";
import { GAME_TICK } from "$game/shared/game.consts.js";

const GRAVITY = 0.07;

export const createPhysics = ({
	movement,
}) => {
	const xVelocity = createVelocity({
		decay : 0.995,
		smoothing : 0.05,
		min : 0.01,
	});

	const yVelocity = createVelocity({
		decay : 0.99,
		smoothing : 0.01,
	});

	let hasGravity = true;

	const applyGravity = () => {
		if(hasGravity) {
			yVelocity.add(GRAVITY);
		}
	};

	applyGravity();

	const isMoving = () => xVelocity.isMoving() || yVelocity.isMoving();

	return {
		isMoving,

		hasUpdate() {
			return isMoving();
		},

		enableGravity() {
			hasGravity = true;
		},

		disableGravity() {
			hasGravity = false;
		},

		addY(value) {
			yVelocity.add(value);
		},

		update() {
			const newX = movement.getX();

			xVelocity.sampleDt(newX - movement.getLastX(), GAME_TICK);

			const newY = movement.getY();

			applyGravity();

			yVelocity.sampleDt(newY - movement.getLastY(), GAME_TICK);
		},

		cancelX() {
			xVelocity.stop();
		},

		cancelY() {
			yVelocity.stop();
		},

		getVelocityX() {
			return xVelocity.value;
		},

		isFalling() {
			return yVelocity.value > 0;
		},

		getVelocityY() {
			return yVelocity.value;
		},

		getDeltaX() {
			return xVelocity.step(GAME_TICK);
		},

		getDeltaY() {
			return yVelocity.step(GAME_TICK);
		},
	};
};
