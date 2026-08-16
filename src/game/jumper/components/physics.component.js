import { input } from "$nissy-girl/input.js";
import { BUTTON_A } from "$game/shared/input.consts.js";
import { createVelocity } from "$util/velocity.js";
import { GAME_TICK } from "$game/shared/game.consts.js";

const GRAVITY = 0.07;
const JUMP_FRAMES = 5;
const JUMP = -2.2;
const FIRST_JUMP = JUMP * 0.7;
const CONSECUTIVE_JUMP = (JUMP - FIRST_JUMP) / JUMP_FRAMES;

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
	let jumpFrames = -1;

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

		update() {
			const newX = movement.getX();

			xVelocity.sampleDt(newX - movement.getLastX(), GAME_TICK);

			deltaX = xVelocity.step(GAME_TICK);
			const newY = movement.getY();

			if(jumping && (isGrounded || jumpFrames !== -1)) {
				const isInitialJump = isGrounded && jumpFrames === -1;

				yVelocity.add(isInitialJump
					? FIRST_JUMP
					: CONSECUTIVE_JUMP);

				if(isInitialJump) {
					jumpFrames = JUMP_FRAMES;
				}
			}

			if(jumpFrames !== -1) {
				jumpFrames--;
			}

			yVelocity.add(GRAVITY);

			yVelocity.sampleDt(newY - movement.getLastY(), GAME_TICK);

			deltaY = yVelocity.step(GAME_TICK);

			isGrounded = false;
		},

		cancelX() {
			xVelocity.stop();
		},

		cancelY() {
			yVelocity.stop();
		},

		getDeltaX() {
			return deltaX;
		},

		getDeltaY() {
			return deltaY;
		},
	};
};
