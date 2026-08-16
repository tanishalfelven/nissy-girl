import { createEntity } from "$game/shared/entity/entity.js";

import JumperPng from "./assets/jumper.png";
import { Assets, Sprite } from "pixi.js";

import { CANVAS_WIDTH, CANVAS_HEIGHT } from "$nissy-girl/screens/screen.consts.js";
import { input } from "$nissy-girl/input.js";
import { BUTTON_A } from "$game/shared/input.consts.js";

import { createMovement, HORZ_AXIS } from "$game/shared/component/movement.js";
import { createVelocity } from "$util/velocity.js";

const GRAVITY = 0.07;
const JUMP = -2.15;

const createPhysics = ({
	movement,
}) => {
	const xVelocity = createVelocity({
		decay : 0.98,
		smoothing : 0.18,
	});

	const yVelocity = createVelocity({
		decay : 0.99,
		smoothing : 0.001,
	});

	let deltaX = 0;
	let deltaY = 0;
	let jumping = false;

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

		update(dt) {
			const newX = movement.getX();

			xVelocity.sampleDt(newX - movement.getLastX(), dt);

			deltaX = xVelocity.step(dt);

			const newY = movement.getY();

			if(jumping && !yVelocity.isMoving()) {
				yVelocity.add(JUMP);
			}

			yVelocity.add(GRAVITY * dt);

			yVelocity.sampleDt(newY - movement.getLastY(), dt);

			deltaY = yVelocity.step(dt);
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

export const createJumper = ({
	world,
}) => {
	const movement = createMovement({
		x : CANVAS_WIDTH / 2,
		y : CANVAS_HEIGHT * 0.7,
		axis : HORZ_AXIS,
		speed : 0.82,
	});

	const physics = createPhysics({
		movement,
	});

	const width = 6;
	const height = 6;

	const jumperSprite = new Sprite({
		position : movement.getPosition(),
		width,
		height,
	});

	return createEntity({
		id : "jumper",
		components : {
			movement,
			physics,
			collision : {
				hasUpdate() {
					return movement.isMoving() || physics.isMoving();
				},

				update() {
					const startX = movement.getLastX();
					const targetX = movement.getX() + physics.getDeltaX();

					const startY = movement.getLastY();
					const targetY = movement.getY() + physics.getDeltaY();

					const result = world.world.getValidPosition(
						startX,
						targetX,
						startY,
						targetY,
						width,
						height,
					);

					if(!result) {
						return;
					}

					if(targetX !== movement.getX()) {
						movement.setX(result.x);

						if(targetX !== result.x) {
							physics.cancelX();
						}
					}

					if(targetY !== movement.getY()) {
						movement.setY(result.y);

						if(targetY !== result.y) {
							physics.cancelY();
						}
					}
				},
			},
			render : {
				async load() {
					jumperSprite.texture = await Assets.load(JumperPng);
				},

				update() {
					jumperSprite.position.set(movement.getX(), movement.getY());
				},

				getRenderable() {
					return jumperSprite;
				},

				destroy() {
					jumperSprite.destroy();
				},
			},
		},
	});
};
