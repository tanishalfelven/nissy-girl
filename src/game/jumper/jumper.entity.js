import { createEntity } from "$game/shared/entity/entity.js";

import JumperPng from "./assets/jumper.png";
import { Assets, Sprite } from "pixi.js";

import { CANVAS_WIDTH, CANVAS_HEIGHT } from "$nissy-girl/screens/screen.consts.js";

import { createMovement, HORZ_AXIS } from "$game/shared/component/movement.js";

export const createJumper = ({
	world,
}) => {
	const movement = createMovement({
		x : CANVAS_WIDTH / 2,
		y : CANVAS_HEIGHT / 2,
		axis : HORZ_AXIS,
		speed : 1,
	});

	const jumperSprite = new Sprite({
		position : movement.getPosition(),
	});

	return createEntity({
		id : "jumper",
		components : {
			movement,
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
			},
		},
	});
};
