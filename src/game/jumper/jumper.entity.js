import { createEntity } from "$game/shared/entity/entity.js";

import JumperPng from "./assets/jumper.png";
import { Assets, Sprite, Container } from "pixi.js";

import { CANVAS_WIDTH, CANVAS_HEIGHT } from "$nissy-girl/screens/screen.consts.js";

import { createMovement, HORZ_AXIS } from "$game/shared/component/movement.js";

import { createPhysics } from "./components/physics.component.js";
import { createCollision } from "./components/collision.component.js";

export const createJumper = ({
	world,
}) => {
	const width = 6;
	const height = 6;

	const movement = createMovement({
		x : CANVAS_WIDTH / 2,
		y : CANVAS_HEIGHT * 0.7,
		axis : HORZ_AXIS,
		speed : 0.82,
	});

	const physics = createPhysics({
		movement,
	});

	const collision = createCollision({
		world,
		movement,
		physics,
		width,
		height,
	});

	const jumperRenderable = new Container({
		position : movement.getPosition(),
		width,
		height,
	});

	const jumperSprite = new Sprite();

	jumperRenderable.addChild(jumperSprite);

	return createEntity({
		id : "jumper",
		components : {
			movement,
			physics,
			collision,
			render : {
				async load() {
					jumperSprite.texture = await Assets.load({
						src : JumperPng,
						data : { scaleMode : "nearest" },
					});
				},

				update() {
					jumperRenderable.position.set(
						movement.getX(),
						movement.getY(),
					);
				},

				getRenderable() {
					return jumperRenderable;
				},

				destroy() {
					jumperSprite.destroy();
				},
			},
		},
	});
};
