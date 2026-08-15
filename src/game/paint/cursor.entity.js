import { createEntity } from "$game/shared/entity/entity.js";

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
	const { camera } = world;
	const cameraBounds = camera.getBounds();
	const { artboard } = world.world.get("artboard");

	const movement = createMovement({
		x : cameraBounds.width / 2,
		y : cameraBounds.height / 2,
		speed : SPEED,
		camera,
	});

	world.camera.follow(movement);

	const pencil = createPencil({ artboard, movement });

	return createEntity({
		id : "cursor",
		components : {
			movement,

			tool : pencil,

			render : {
				update() {
					pencil.render();
				},
			},
		},
	});
};
