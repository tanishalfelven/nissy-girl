import { createActor, createMachine, raise } from "xstate";

import { clamp } from "$util/math.js";

import { stateLogger } from "$util/state-logger.actor.js";

import { cubicInOut } from "svelte/easing";

const HIGH_JUMP = -2.9;
const INITIAL_JUMP = -1.9;
const CONSECUTIVE_JUMP = -0.05;
const NUM_CONSECUTIVE_JUMPS = 20;

const IMPACT_FALL = 13;
const CALM_FRAMES = 14;
const MAX_PANIC = 18;

export const createBehavior = ({
	world,
	width,
	movement,
	physics,
	updateCanMove,
}) => {
	let isGrounded = false;
	let lastPlatformIndex = -1;

	let jumpIntent = false;
	let consecutiveJumps = 0;
	let isJumping = false;

	let isImpact = false;
	let fallTime = 0;

	let crouchIntent = false;
	let isCrouching = false;

	const normalMoveX = () => {
		const targetX = movement.getX() + physics.getDeltaX();

		movement.setX(targetX);
	};

	const stillOnPlatform = () => {
		if(lastPlatformIndex === -1) {
			return false;
		}

		return world.world.isAtStationaryBoundary(
			lastPlatformIndex,
			movement.getX() - width / 2,
			movement.getY(),
			width,
		);
	};

	const behavior = createActor(createMachine({
		id : "jumper-behavior",

		invoke : stateLogger,

		initial : "none",

		always : {
			// no X collision exists yet so... we cheat
			actions : normalMoveX,
		},

		states : {
			none : {
				always : {
					guard : () => physics.isFalling(),
					target : "airborne.falling",
				},
			},

			grounded : {
				initial : "stationary",

				entry : () => {
					physics.cancelY();
					physics.disableGravity();
				},

				on : {
					TICK_X : {
						guard : () => !stillOnPlatform(),
						actions : () => {
							lastPlatformIndex = -1;
						},
						target : "airborne.falling",
					},

					TICK_Y : {
						guard : () => jumpIntent,
						actions : [
							raise({ type : "JUMP" }),
							() => physics.addY(INITIAL_JUMP),
						],
					},

					JUMP : "airborne.jumping",
				},

				always : {
					guard : () => crouchIntent,
					target : ".crouch",
				},

				states : {
					impact : {
						after : {
							150 : "stationary",
						},

						entry : () => {
							isImpact = true;
						},

						exit : () => {
							isImpact = false;
							fallTime = 0;
						},
					},

					crouch : {
						entry : () => {
							isCrouching = true;
							physics.cancelX();

							// block movement from updating position
							updateCanMove(false);
						},

						exit : () => {
							isCrouching = false;
						},

						on : {
							TICK_Y : {
								guard : () => jumpIntent,
								actions : [
									raise({ type : "JUMP" }),
									() => physics.addY(HIGH_JUMP),
									// intentionally do not re-enable movement here
									// it is always re-enabled at the end of rising frames
									// this forces a stricter horizontal path
								],
							},
						},

						always : [
							{
								guard : () => !crouchIntent,
								target : "stationary",
								// restore allowing movement to update its position
								actions : () => updateCanMove(true),
							},
						],
					},

					stationary : {},
				},
			},

			airborne : {
				initial : "falling",

				entry : () => {
					isGrounded = false;
					physics.enableGravity();
				},

				on : {
					IMPACT : "grounded.impact",
					LAND : "grounded.stationary",

					PROCESS_VERT : {
						actions : () => {
							const x = movement.getX();
							const startY = movement.getLastY();
							const targetY = movement.getY() + physics.getDeltaY();

							const result = world.world.getValidPosition(
								x - width / 2,
								startY,
								x - width / 2,
								targetY,
								width,
							);

							if(targetY !== movement.getY()) {
								movement.setY(result.y);

								if(targetY !== result.y) {
									lastPlatformIndex = result.index;
									isGrounded = true;
								}
							}
						},
					},

					TICK_Y : {
						actions : raise({ type : "PROCESS_VERT" }),
					},
				},

				states : {
					jumping : {
						entry : () => {
							isJumping = true;
							consecutiveJumps = 0;
						},
						exit : () => {
							isJumping = false;
							consecutiveJumps = NUM_CONSECUTIVE_JUMPS;
						},

						on : {
							TICK_Y : [
								{
									guard : () => jumpIntent && consecutiveJumps < NUM_CONSECUTIVE_JUMPS,
									actions : [
										() => {
											physics.addY(CONSECUTIVE_JUMP),
											consecutiveJumps++;
										},
										raise({ type : "PROCESS_VERT" }),
									],
								},
								{
									target : "rising",
									actions : raise({ type : "PROCESS_VERT" }),
								},
							],
						},
					},

					rising : {
						exit : () => {
							updateCanMove(true);
						},

						always : {
							guard : () => physics.isFalling(),
							target : "falling",
						},
					},

					falling : {
						on : {
							TICK_Y : [
								{
									guard : () => isGrounded && fallTime > IMPACT_FALL,
									actions : [
										raise({ type : "IMPACT" }),
										raise({ type : "PROCESS_VERT" }),
									],
								},
								{
									guard : () => isGrounded,
									actions : [
										raise({ type : "LAND" }),
										raise({ type : "PROCESS_VERT" }),
									],
								},
								{
									actions : [
										() => {
											fallTime++;
										},
										raise({ type : "PROCESS_VERT" }),
									],
								},
							],
						},
					},
				},
			},
		},
	}));

	behavior.start();

	return {
		isGrounded : () => isGrounded,
		isImpact : () => isImpact,
		isJumping : () => isJumping,
		isCrouching : () => isCrouching,
		isJumpFrame : () => isJumping && consecutiveJumps < 3,
		getPanic : () => cubicInOut(clamp((fallTime - CALM_FRAMES) / MAX_PANIC, 0, 1)),

		setJumpIntent(newJumpIntent) {
			jumpIntent = newJumpIntent;
		},

		setCrouchIntent(newCrouchIntent) {
			crouchIntent = newCrouchIntent;
		},

		hasUpdate() {
			return movement.isMoving()
				|| physics.isMoving()
				|| isJumping
				|| ((jumpIntent || crouchIntent) && isGrounded)
				|| isImpact;
		},

		update() {
			behavior.send({ type : "TICK_X" });
			behavior.send({ type : "TICK_Y" });

			return true;
		},

		destroy() {
			behavior.stop();
		},
	};
};
