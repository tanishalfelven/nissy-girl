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
			const whiteSize = lerp(1.8, 2.3, panic);
			const pupilSize = lerp(0.9, 1, 1 - panic);

			const mouthX = 3;
			const mouthY = 4;
			const mouthSize = lerp(0, 1.7, panic);

			face
				.ellipse(mouthX, mouthY, 3, mouthSize)
				.fill(COLOR_BLACK);

			if(mouthSize > 0.5) {
				face
					.ellipse(mouthX - dirX, mouthY + 1, 1, 0.5)
					.fill(COLOR_RED);
			}

			face.ellipse(eyeX, eyeY, 2.25, whiteSize).fill(COLOR_WHITE);
			face.ellipse(eyeX + RIGHT_EYE_OFFSET, eyeY, 2.25, whiteSize).fill(COLOR_WHITE);

			face.circle(eyeX + pupilX, eyeY + pupilY, pupilSize).fill(COLOR_BLACK);
			face.circle(eyeX + RIGHT_EYE_OFFSET + pupilX, eyeY + pupilY, pupilSize).fill(COLOR_BLACK);
		},
	};
};

export const createJumperRender = ({
	behavior,
	movement,
	physics,
	width,
	height,
}) => {
	const jumperRenderable = new Container({
		position : movement.getPosition(),
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

	return {
		async load() {
			jumperSprite.texture = await Assets.load({
				src : JumperPng,
				data : { scaleMode : "nearest" },
			});
		},

		update(dt) {
			jumperRenderable.position.set(
				movement.getX(),
				movement.getY(),
			);

			if(behavior.isJumping()) {
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

		getRenderable() {
			return jumperRenderable;
		},

		destroy() {
			jumperSprite.destroy();
		},
	};
};
