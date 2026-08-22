import JumperPng from "./assets/jumper.png";
import { Assets, Sprite, Container, Graphics } from "pixi.js";
import { COLOR_BLACK, COLOR_WHITE, COLOR_RED } from "$nissy-girl/screens/render.consts.js";

import { lerp } from "$util/math.js";

const RIGHT_EYE_OFFSET = 3;

const createFace = ({ physics, behavior }) => {
	const face = new Graphics({
		scaleMode : "nearest",
	});

	return {
		getRenderable() {
			return face;
		},

		update() {
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

	updatePosition();

	const updateEnabled = () => {
		if(enabled) {
			updatePosition();
		}

		jumperRenderable.visible = enabled;
	};

	updateEnabled();

	return {
		update(dt) {
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

			face.update(dt);
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

	return {
		async load() {
			const jumperBg = await Assets.load({
				src : JumperPng,
				data : { scaleMode : "nearest" },
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

		update(dt) {
			if(behavior.isWrapping() && !mirror.getEnabled()) {
				mirror.setOffset(behavior.getWrapOffset());
				mirror.setEnabled(true);
			} else if(!behavior.isWrapping() && mirror.getEnabled()) {
				mirror.setEnabled(false);
			}

			jumper.update(dt);
			mirror.update(dt);
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
