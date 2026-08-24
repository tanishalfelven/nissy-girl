import JumperPng from "./assets/jumper.png";
import { Assets, Sprite, Container, Graphics } from "pixi.js";
import { COLOR_BLACK, COLOR_WHITE, COLOR_RED, COLOR_PORCELAIN_RED } from "$nissy-girl/screens/render.consts.js";

import { lerp } from "$util/math.js";

const RIGHT_EYE_OFFSET = 3;
const BLUSH_DURATION = 100;

// equal bound smooth step
const smoothStep = (t, bound) =>
	Math.min(
		1,
		Math.min(t / bound, (1 - t) / bound),
	);

const blushTime = (blush) => smoothStep((BLUSH_DURATION - blush) / BLUSH_DURATION, 0.15);

const createFace = ({ physics, behavior }) => {
	const face = new Graphics();

	return {
		getRenderable() {
			return face;
		},

		update(dt, blushT) {
			face.clear();

			const vx = physics.getVelocityX();
			const vy = physics.getVelocityY();

			const isImpact = behavior.isImpact();
			const panic = behavior.getPanic();

			const dirX = Math.sign(vx);
			const dirY = Math.sign(vy);

			const pupilX = dirX;
			const pupilY = dirY;

			const eyeX = dirX * 2 + 1.5;
			const eyeY = 1 + (isImpact ? 2 : 0);
			const whiteSize = lerp(panic, 1.8, 2.3);
			const pupilSize = lerp(1 - panic, 0.9, 1);

			const mouthX = 3;
			const mouthY = 4;
			const mouthSize = lerp(panic, 0, 1.7);

			face
				.ellipse(mouthX, mouthY, 3, mouthSize)
				.fill(COLOR_BLACK);

			if(mouthSize > 0.5) {
				const tongueY = mouthY + mouthSize * 0.6;

				face
					.ellipse(mouthX - dirX, tongueY, 2, 0.5)
					.fill(COLOR_RED);
			}

			face.ellipse(eyeX, eyeY, 2.25, whiteSize).fill(COLOR_WHITE);
			face.ellipse(eyeX + RIGHT_EYE_OFFSET, eyeY, 2.25, whiteSize).fill(COLOR_WHITE);

			face.circle(eyeX + pupilX, eyeY + pupilY, pupilSize).fill(COLOR_BLACK);
			face.circle(eyeX + RIGHT_EYE_OFFSET + pupilX, eyeY + pupilY, pupilSize).fill(COLOR_BLACK);

			if(blushT > 0) {
				const blushX = dirX;
				const blushSize = 1.5;
				const blushY = 3 + dirY * 0.5;

				const alpha = blushT * 0.8;

				face.scale.set(1, 1 - blushT * 0.4);

				face.circle(blushX, blushY, blushSize).fill({ color : COLOR_PORCELAIN_RED, alpha });
				face.circle(blushX + 6, blushY, blushSize).fill({ color : COLOR_PORCELAIN_RED, alpha });
			}
		},
	};
};

const createJumper = ({
	width,
	height,
	movement,
	physics,
	behavior,
	offset = 0,
	enabled = true,
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

	jumperRenderable.addChild(jumperSprite);
	jumperRenderable.addChild(face.getRenderable());

	const updatePosition = () => {
		jumperRenderable.position.set(
			movement.getX() + offset,
			movement.getY(),
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
		update(dt, blushT) {
			if(!enabled) {
				return;
			}

			updatePosition();

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
	});

	const mirror = createJumper({
		width,
		height,
		movement,
		physics,
		behavior,
		enabled : false,
	});

	let blushDuration = 0;

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

		update(dt) {
			if(behavior.isWrapping() && !mirror.getEnabled()) {
				mirror.setOffset(behavior.getWrapOffset());
				mirror.setEnabled(true);
			} else if(!behavior.isWrapping() && mirror.getEnabled()) {
				mirror.setEnabled(false);
			}

			const isBlushing = blushDuration > 0;

			const blush = isBlushing ? blushTime(blushDuration) : 0;

			jumper.update(dt, blush);
			mirror.update(dt, blush);

			if(isBlushing) {
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
