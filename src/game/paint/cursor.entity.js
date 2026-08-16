import { createEntity } from "$game/shared/entity/entity.js";

import { createTool } from "./tools/tool.component.js";

import { createMovement } from "$game/shared/component/movement.js";

const SCALE_TO_SPEED = {
	1 : 0.45,
	3 : 0.3,
};

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

	let cameraScale = camera.getZoomScale();

	const movement = createMovement({
		x : cameraBounds.width / 2,
		y : cameraBounds.height / 2,
		speed : SCALE_TO_SPEED[cameraScale],
		camera,
	});

	world.camera.follow(movement);

	const tool = createTool({ artboard, movement });

	return createEntity({
		id : "cursor",
		components : {
			movement,

			tool,

			camera : {
				update() {
					const zoomScale = camera.getZoomScale();

					if(zoomScale !== cameraScale) {
						cameraScale = zoomScale;

						movement.setSpeed(SCALE_TO_SPEED[cameraScale]);
					}
				},
			},

			render : {
				update() {
					tool.render();
				},
			},
		},
	});
};
