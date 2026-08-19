import { createActor, createMachine, raise } from "xstate";

import { clamp } from "$util/math.js";

import { stateLogger } from "$util/state-logger.actor.js";

import { cubicInOut } from "svelte/easing";

const HIGH_JUMP = -2.9;
const INITIAL_JUMP = -1.7;
const CONSECUTIVE_JUMP = -0.05;
const NUM_CONSECUTIVE_JUMPS = 20;

const IMPACT_FALL = 13;
const IMPACT_DUST_THRESHOLD = 38;
const CALM_FRAMES = 14;
const MAX_PANIC = 18;

export const createBehavior = ({
	world,

	width,
	height,

	movement,
	physics,

	updateCanMove,

	landSpeed,
	airSpeed,
}) => {
	let isGrounded = false;
	let lastPlatformIndex = -1;

	let jumpIntent = false;
	let consecutiveJumps = 0;
	let isJumping = false;
	let isHighJump = false;

	let isImpact = false;
	let impactFallTime = 0;
	let fallTime = 0;

	let crouchIntent = false;
	let isCrouching = false;

	const platforms = world.world.get("platforms");
	const { particles } = world;

	const spawnDustTrail = (yOffset = height / 2, scale = 1) => {
		particles.spawnDust(
			movement.getX(),
			movement.getY() - yOffset,
			0,
			0.15 * Math.random(),
			scale,
			scale,
		);
	};

	const spawnLateralDust = (yOffset = height / 4, scale = 1) => {
		particles.spawnDust(
			movement.getX() - width / 2,
			movement.getY() - yOffset,
			-0.1 * Math.random(),
			0,
			scale,
			scale,
		);

		particles.spawnDust(
			movement.getX() + width / 2,
			movement.getY() - yOffset,
			0.1 * Math.random(),
			0,
			scale,
			scale,
		);

		spawnDustTrail(yOffset, scale);
	};

	const stillOnPlatform = () => {
		if(lastPlatformIndex === -1) {
			return false;
		}

		return platforms.bounds.remainsGrounded(
			lastPlatformIndex,
			movement.getX() - width / 2,
			movement.getY(),
			width,
		);
	};

	// This is an interesting expirement - Loving the flexibility
	// one note - `always` is a total footgun. Things need to update directly from tick.
	const behavior = createActor(createMachine({
		id : "jumper-behavior",

		invoke : stateLogger,

		initial : "none",

		on : {
			PROCESS_HORZ : {
				// no X collision exists yet so... we cheat
				actions : () => {
					const targetX = movement.getX() + physics.getDeltaX();

					movement.setX(targetX);
				},
			},

			TICK_X : {
				actions : raise({ type : "PROCESS_HORZ" }),
			},
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
					movement.setSpeed(landSpeed);
				},

				on : {
					TICK_X : [
						{
							guard : () => !stillOnPlatform(),
							actions : [
								() => {
									lastPlatformIndex = -1;
								},
								raise({ type : "PROCESS_HORZ" }),
							],
							target : "airborne.falling",
						},
						{
							guard : () => crouchIntent,
							target : ".crouch",
						},
					],

					TICK_Y : {
						guard : () => jumpIntent,
						actions : [
							raise({ type : "JUMP" }),
							() => physics.addY(INITIAL_JUMP),
						],
					},

					JUMP : "airborne.jumping",
				},

				states : {
					impact : {
						after : {
							150 : "stationary",
						},

						entry : () => {
							isImpact = true;

							if(impactFallTime > IMPACT_DUST_THRESHOLD) {
								spawnLateralDust(0, 0.65);
							}
						},

						exit : () => {
							isImpact = false;
							impactFallTime = 0;
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
							TICK_Y : [
								{
									guard : () => jumpIntent && crouchIntent,
									actions : [
										raise({ type : "JUMP" }),
										() => {
											physics.addY(HIGH_JUMP);
											spawnLateralDust();
											isHighJump = true;
										},
									// intentionally do not re-enable movement here
									// it is always re-enabled at the end of rising frames
									// this forces a stricter horizontal path
									],
								},
								{
									guard : () => !crouchIntent,
									target : "stationary",
									// restore allowing movement to update its position
									actions : () => updateCanMove(true),
								},
							],
						},
					},

					stationary : {},
				},
			},

			airborne : {
				initial : "falling",

				entry : () => {
					isGrounded = false;
					physics.enableGravity();
					movement.setSpeed(airSpeed);
				},

				exit : () => {
					fallTime = 0;
				},

				on : {
					IMPACT : "grounded.impact",
					LAND : "grounded.stationary",

					PROCESS_VERT : {
						actions : () => {
							const x = movement.getX();
							const startY = movement.getLastY();
							const targetY = movement.getY() + physics.getDeltaY();

							const result = platforms.bounds.moveIntersectsPlatform(
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
							isHighJump = false;
							consecutiveJumps = NUM_CONSECUTIVE_JUMPS;
						},

						on : {
							TICK_Y : [
								{
									guard : () => jumpIntent && consecutiveJumps < NUM_CONSECUTIVE_JUMPS,
									actions : [
										() => {
											physics.addY(CONSECUTIVE_JUMP);
											consecutiveJumps++;

											if(((consecutiveJumps % 6) === 0) && isHighJump) {
												spawnDustTrail();
											}
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

						on : {
							TICK_Y : {
								guard : () => physics.isFalling(),
								target : "falling",
							},
						},
					},

					falling : {
						on : {
							TICK_Y : [
								{
									guard : () => isGrounded && fallTime > IMPACT_FALL,
									actions : [
										() => {
											impactFallTime = fallTime;
										},
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
				// they should not have given gay people boolean operators
				|| (isGrounded
					&& (jumpIntent
						|| (crouchIntent !== isCrouching)))
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
