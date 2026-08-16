import { input } from "$nissy-girl/input.js";
import { BUTTON_A } from "$game/shared/input.consts.js";
import { createVelocity } from "$util/velocity.js";

const GRAVITY = 0.07;
const JUMP = -2.15;

export const createPhysics = ({
	movement,
}) => {
	const xVelocity = createVelocity({
		decay : 0.98,
		smoothing : 0.05,
	});

	const yVelocity = createVelocity({
		decay : 0.99,
		smoothing : 0.001,
	});

	let deltaX = 0;
	let deltaY = 0;
	let jumping = false;
	let isGrounded = false;

	const isMoving = () => deltaX !== 0 || deltaY !== 0;

	return {
		hasUpdate() {
			return true;
		},

		handleInput() {
			if(input.state[BUTTON_A] !== jumping) {
				jumping = input.state[BUTTON_A];
			}
		},

		isMoving,

		setGrounded(newIsGrounded) {
			isGrounded = newIsGrounded;
		},

		update(dt) {
			const newX = movement.getX();

			xVelocity.sampleDt(newX - movement.getLastX(), dt);

			deltaX = xVelocity.step(dt);

			const newY = movement.getY();

			if(jumping && isGrounded) {
				yVelocity.add(JUMP);
			}

			yVelocity.add(GRAVITY * dt);

			yVelocity.sampleDt(newY - movement.getLastY(), dt);

			deltaY = yVelocity.step(dt);

			isGrounded = false;
		},

		cancelX() {
			xVelocity.set(0);
		},

		cancelY() {
			yVelocity.set(0);
		},

		getDeltaX() {
			return deltaX;
		},

		getDeltaY() {
			return deltaY;
		},
	};
};
