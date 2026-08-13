import { Sprite, Assets } from "pixi.js";

import { createEntity } from "$game/shared/entity/entity.js";

import moveUrl from "./assets/cursor-move.png";
import stationaryUrl from "./assets/cursor-stationary.png";

import { createPencil } from "./tools/pencil.js";
import { createMovement } from "$game/shared/component/movement.js";

const SPEED = 0.45;

/** @import { WorldEntity } from "$src/game/shared/entity/world.entity.js" */

/**
 * @param {object} options
 * @param {WorldEntity} options.world
 * @returns {import("$game/shared/entity/scene.entity.js").Entity}
 */
export const createCursor = ({
	world,
}) => {
	const sprite = new Sprite();
	const textures = {};

	const { width, height } = world.camera.getBounds();
	const { artboard } = world.world.get("artboard");

	const movement = createMovement({
		x : width / 2,
		y : height / 2,
		speed : SPEED,
	});

	world.camera.follow(movement);

	const pencil = createPencil({ artboard, movement });

	return createEntity({
		id : "cursor",
		components : {
			movement,

			tool : pencil,

			render : {
				async load() {
					const move = await Assets.load({ src : moveUrl, data : { scaleMode : "nearest" } });
					const stationary = await Assets.load({ src : stationaryUrl, data : { scaleMode : "nearest" } });

					textures.move = move;
					textures.stationary = stationary;

					sprite.texture = stationary;

					return true;
				},

				update() {
					sprite.texture = textures[movement.isMoving() ? "move" : "stationary"];

					sprite.x = movement.getX();
					sprite.y = movement.getY();

					// tool component implements its own render we delegate to in cursor render
					pencil.render();
				},

				getRenderable() {
					return sprite;
				},

				destroy() {
					sprite.destroy();
				},
			},
		},
	});
};
