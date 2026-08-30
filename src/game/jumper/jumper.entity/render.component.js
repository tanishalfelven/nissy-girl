import JumperPng from "./assets/jumper.png";
import { Assets, Sprite, Container, Graphics } from "pixi.js";
import { COLOR_BLACK, COLOR_WHITE, COLOR_RED, COLOR_PORCELAIN_RED } from "$nissy-girl/screens/render.consts.js";

import { lerp } from "$util/math.js";
import { FPS60 } from "$util/time.js";
import { quadInOut } from "svelte/easing";

const RIGHT_EYE_OFFSET = 2.5;
const BLUSH_DURATION = 100;

// halfway thru blush is max animation
// save it as a reference and use that to determine stop time for ending it (finish game just leaves it on indefiniteyl)
const BLUSH_FINISH_FREEZE = BLUSH_DURATION / 2;

// equal bound smooth step
const smoothStep = (t, bound) =>
	Math.min(
		1,
		Math.min(t / bound, (1 - t) / bound),
	);

const blushTime = (blush) => smoothStep((BLUSH_DURATION - blush) / BLUSH_DURATION, 0.15);

const createFace = ({ physics, behavior }) => {
	const pupils = new Graphics();
	const eyes = new Graphics();
	const blush = new Graphics({ visible : false });
	const tongue = new Graphics({ visible : false });
	const mouth = new Graphics({ visible : true });

	const face = new Container({
		children : [
			mouth,
			tongue,
			eyes,
			pupils,
			blush,
		],

		y : 1,
	});

	const eyeX = 1.6;
	const eyeY = 0;
	const whiteSize = 2.35;
	const pupilSize = 1.25;

	const mouthX = 3;
	const mouthY = 4;
	const mouthSize = 1.5;

	mouth
		.ellipse(mouthX, mouthY, 2.5, mouthSize)
		.fill(COLOR_BLACK);

	const tongueY = mouthY;

	tongue
		.rect(mouthX - 1, tongueY, 2, 0.75)
		.fill(COLOR_RED);

	eyes.ellipse(eyeX, eyeY, 3, whiteSize).fill(COLOR_WHITE);
	eyes.ellipse(eyeX + RIGHT_EYE_OFFSET, eyeY, 2.25, whiteSize).fill(COLOR_WHITE);

	const pupilY = -0.25;

	pupils.circle(eyeX - 0.5, eyeY + pupilY, pupilSize).fill(COLOR_BLACK);
	pupils.circle(eyeX + RIGHT_EYE_OFFSET, eyeY + pupilY, pupilSize).fill(COLOR_BLACK);

	const blushX = 0;
	const blushSize = 1.5;
	const blushY = 3;

	blush.circle(blushX, blushY, blushSize).fill({ color : COLOR_PORCELAIN_RED });
	blush.circle(blushX + 6, blushY, blushSize).fill({ color : COLOR_PORCELAIN_RED });

	return {
		getRenderable() {
			return face;
		},

		destroy() {
			face.destroy();
		},

		update(dt, blushT) {
			const vx = physics.getVelocityX();
			const vy = physics.getVelocityY();

			const dirX = Math.sign(vx);
			const dirY = Math.sign(vy);

			const isImpact = behavior.isImpact();
			const panic = behavior.getPanic();

			const whiteSize = lerp(panic, 1, 1.05);

			const eyeOffsetY = isImpact ? 2 : 0;

			eyes.scale.set(1, whiteSize);
			eyes.position.set(dirX * 1.2, eyeOffsetY);

			const pupilXScale = lerp(panic, 1, 1.2);
			const pupilYScale = lerp(panic, 1, 0.8);

			pupils.scale.set(pupilXScale, pupilYScale);
			pupils.position.set(dirX * 1.6, eyeOffsetY + dirY);

			mouth.visible = panic > 0;
			if(mouth.visible) {
				mouth.scale.y = panic;
			}

			tongue.visible = panic > 0.5;
			if(tongue.visible) {
				tongue.position.x = dirX * -1.2;
			}

			blush.visible = blushT > 0;

			if(blush.visible) {
				blush.alpha = blushT * 0.8;
				blush.position.set(0, dirY * 0.5);

				face.updateTransform({ scaleY : 1 - blushT * 0.4 });
			}
		},
	};
};

const SPOTLIGHT_DURATION = 2000 / FPS60;

const createStageLights = ({
	world,
	movement,
	width,
	height,
}) => {
	const { camera } = world;

	let x = 0;
	let y = 0;

	const spotlight = new Graphics()
		.ellipse(x, y, width * 3, height * 3)
		.fill({ color : COLOR_WHITE, alpha : 0.05 });

	spotlight.alpha = 0;

	let max = SPOTLIGHT_DURATION;

	world.world.getScreen().addChild(spotlight);

	return {
		update(dt) {
			max = Math.max(0, max - dt);

			const maxT = max / SPOTLIGHT_DURATION;

			if(spotlight.alpha < 1) {
				spotlight.alpha += 0.08 * dt;
			}

			const target = camera.cameraToScreen(movement.getX(), movement.getY());

			x = lerp(1 - maxT, x, target.x);
			y = lerp(1 - maxT, y, target.y);

			spotlight.scale.set(quadInOut(maxT) + 1);
			spotlight.position.set(x, y);
		},

		destroy() {
			spotlight.destroy();
		},
	};
};

const createJumper = ({
	width,
	height,
	movement,
	physics,
	behavior,
	enabled = true,
	world,
	// offset used for mirrored jumper
	offset = 0,
}) => {
	const jumperRenderable = new Container({
		width,
		height,
		pivot : { x : width / 2, y : height },
	});

	const jumperSprite = new Sprite({
		anchor : 0.5,
		x : width / 2,
		y : height / 2,
	});
	const face = createFace({ physics, behavior });

	let stageLights = false;

	jumperRenderable.addChild(jumperSprite);
	jumperRenderable.addChild(face.getRenderable());

	const updatePosition = (alpha) => {
		let y = movement.getY();
		const lastY = movement.getLastY();

		jumperRenderable.position.set(
			movement.getX() + offset,
			lerp(alpha, lastY, y),
		);
	};

	const updateEnabled = () => {
		if(enabled) {
			updatePosition();
		}

		jumperRenderable.visible = enabled;
	};

	updatePosition();
	updateEnabled();

	return {
		update(dt, alpha, blushT) {
			if(!enabled) {
				return;
			}

			if(stageLights) {
				stageLights.update(dt);
			}

			updatePosition(alpha);

			if(behavior.isJumpFrame()) {
				jumperRenderable.scale.x = 1.4;
				jumperRenderable.scale.y = 0.6;
			} else if(behavior.isCrouching()) {
				jumperRenderable.scale.x = 1.5;
				jumperRenderable.scale.y = 0.35;
			} else {
				jumperRenderable.scale.x = 1;
				jumperRenderable.scale.y = 1;
			}

			face.update(dt, blushT);
		},

		stageLights() {
			stageLights = createStageLights({
				movement,
				world,
				width,
				height,
			});
		},

		setOffset(newOffset) {
			offset = newOffset;
		},

		getEnabled() {
			return enabled;
		},

		setEnabled(newEnabled) {
			enabled = newEnabled;

			updateEnabled();
		},

		setBg(jumperBg) {
			jumperSprite.texture = jumperBg;
		},

		getRenderable() {
			return jumperRenderable;
		},

		destroy() {
			jumperRenderable.destroy();
			face.destroy();

			if(stageLights) {
				stageLights.destroy();
			}
		},
	};
};

export const createJumperRender = ({
	world,
	movement,
	physics,
	behavior,
	width,
	height,
}) => {
	const jumper = createJumper({
		width,
		height,
		movement,
		getX : movement.getX,
		getY : movement.getY,
		physics,
		behavior,
		world,
	});

	const mirror = createJumper({
		width,
		height,
		movement,
		physics,
		behavior,
		enabled : false,
		world,
	});

	let blushDuration = 0;
	let isGameFinished = false;

	return {
		async load() {
			const jumperBg = await Assets.load({
				src : JumperPng,
			});

			jumper.setBg(jumperBg);
			mirror.setBg(jumperBg);

			const worldRenderable = world.world.getRenderable();

			// insert mirror next to the real jumper
			worldRenderable.addChildAt(
				mirror.getRenderable(),
				worldRenderable.getChildIndex(jumper.getRenderable()),
			);
		},

		reactToCollect() {
			blushDuration = BLUSH_DURATION;
		},

		finishGame() {
			blushDuration = BLUSH_DURATION;
			isGameFinished = true;
			jumper.stageLights();
		},

		update(dt, alpha) {
			if(behavior.isWrapping() && !mirror.getEnabled()) {
				mirror.setOffset(behavior.getWrapOffset());
				mirror.setEnabled(true);
			} else if(!behavior.isWrapping() && mirror.getEnabled()) {
				mirror.setEnabled(false);
			}

			const isBlushing = blushDuration > 0;

			const blush = isBlushing ? blushTime(blushDuration) : 0;

			jumper.update(dt, alpha, blush);
			mirror.update(dt, alpha, blush);

			if(isBlushing) {
				if(isGameFinished && blushDuration <= BLUSH_FINISH_FREEZE) {
					return;
				}

				blushDuration = Math.max(0, blushDuration - dt);
			}
		},

		getRenderable() {
			return jumper.getRenderable();
		},

		destroy() {
			jumper.destroy();
			mirror.destroy();
		},
	};
};
