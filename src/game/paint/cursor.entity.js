import { Sprite, Assets } from "pixi.js";

import moveUrl from "./assets/cursor-move.png";
import stationaryUrl from "./assets/cursor-stationary.png";
import { createEntity } from "$game/shared/entity/entity.js";

import { createPencil } from "./tools/pencil.js";
import { createMovement } from "$game/shared/component/movement.js";

const SPEED = 0.35;

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

	const movement = createMovement({
		x : 50,
		y : 50,
		speed : SPEED,
	});

	const { artboard } = world.world.get("artboard");

	const pencil = createPencil({ artboard, movement });

	return createEntity({
		id : "cursor",
		components : {
			movement,

			tool : pencil,

			render : {
				async load() {
					const move = await Assets.load(moveUrl);
					const stationary = await Assets.load(stationaryUrl);

					textures.move = move;
					textures.stationary = stationary;

					sprite.texture = stationary;

					return true;
				},
				update() {
					sprite.texture = textures[movement.isMoving() ? "move" : "stationary"];

					sprite.x = Math.round(movement.getX());
					sprite.y = Math.round(movement.getY());

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
