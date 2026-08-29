import JumperPng from "./assets/jumper.png";
import { Assets, Sprite, Container, Graphics } from "pixi.js";
import { COLOR_BLACK, COLOR_WHITE, COLOR_RED, COLOR_PORCELAIN_RED } from "$nissy-girl/screens/render.consts.js";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "$nissy-girl/screens/screen.consts.js";

import { lerp } from "$util/math.js";
import { FPS60 } from "$util/time.js";
import { quadOut } from "svelte/easing";

const RIGHT_EYE_OFFSET = 3;
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
	const face = new Graphics();

	return {
		getRenderable() {
			return face;
		},

		destroy() {
			face.destroy();
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

const SPOTLIGHT_DURATION = 2000 / FPS60;

const createStageLights = ({
	world,
	movement,
	width,
	height,
}) => {
	const { camera } = world;

	const stageLight = new Container();
	const mask = new Graphics();
	const darkness = new Graphics()
		.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
		.fill({ color : COLOR_BLACK, alpha : 0.75 });

	const matchStageLight = () => {
		stageLight.position.set(camera.getWorldX(), camera.getWorldY());
		const scale = camera.getScale();
		// this is fucked
		stageLight.scale.set(1 / scale.x, 1 / scale.y);
	};

	matchStageLight();

	stageLight.alpha = 0;

	let max = SPOTLIGHT_DURATION;

	const updateMask = (scale = 8) => {
		mask
			.clear()
			.rect(camera.getWorldX(), camera.getWorldY(), CANVAS_WIDTH, CANVAS_HEIGHT)
			.fill(COLOR_WHITE)
			.ellipse(movement.getX(), movement.getY(), width * scale, height * scale)
			.cut();
	};

	updateMask();

	darkness.mask = mask;

	stageLight.addChild(darkness);

	world.world.getRenderable().addChild(stageLight);

	return {
		update(dt) {
			matchStageLight();

			max = Math.max(0, max - dt);

			const maxT = max / SPOTLIGHT_DURATION;

			if(stageLight.alpha < 1) {
				stageLight.alpha += 0.08 * dt;
			}

			updateMask(2 + quadOut(maxT) * 2.6);
		},

		destroy() {
			stageLight.destroy();
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

			if(stageLights) {
				stageLights.update(dt);
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
