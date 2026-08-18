import JumperPng from "./assets/jumper.png";
import { Assets, Sprite, Container, Graphics } from "pixi.js";
import { COLOR_BLACK, COLOR_WHITE, COLOR_RED } from "$nissy-girl/screens/render.consts.js";

import { clamp, lerp } from "$util/math.js";

import { cubicInOut } from "svelte/easing";

const CALM_FRAMES = 14;
const MAX_PANIC = 18;
const IMPACT_FALL = 13;
const IMPACT_DURATION = 3;
const RIGHT_EYE_OFFSET = 3;

const createFace = ({ physics }) => {
	const face = new Graphics({
		scaleMode : "nearest",
	});

	let fallTime = 0;
	let impactTime = 0;

	return {
		getRenderable() {
			return face;
		},

		update(dt) {
			const vx = physics.getVelocityX();
			const vy = physics.getVelocityY();

			if(impactTime > 0) {
				impactTime -= dt;
			} else {
				impactTime = 0;
			}

			if(!physics.getIsGrounded() && vy > 0) {
				fallTime += dt;
			} else {
				if(fallTime > IMPACT_FALL) {
					impactTime = IMPACT_DURATION * (fallTime / IMPACT_FALL);
				}

				fallTime = 0;
			}

			const isImpact = impactTime !== 0;

			const dirX = Math.sign(vx);
			const dirY = Math.sign(vy);

			const pupilX = dirX;
			const pupilY = dirY;

			face.clear();

			const panic = cubicInOut(clamp((fallTime - CALM_FRAMES) / MAX_PANIC, 0, 1));

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
	movement,
	physics,
	width,
	height,
}) => {
	const jumperRenderable = new Container({
		position : movement.getPosition(),
		width,
		height,
	});
	const jumperSprite = new Sprite({ anchor : 0.5, x : width / 2, y : height / 2 });
	const face = createFace({ physics });

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

			jumperSprite.scale.x = physics.isJumping() ? 1.4 : 1;
			jumperSprite.scale.y = physics.isJumping() ? 0.4 : 1;

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
