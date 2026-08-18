import { createEntity } from "$game/shared/entity/entity.js";

import { createTool } from "./tools/tool.component.js";
import { createInput, resolveDirectionX, resolveDirectionY } from "$game/shared/component/input.component.js";
import { createMovement } from "$game/shared/component/movement.component.js";

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
	world : worldEntity,
}) => {
	const { camera, world } = worldEntity;
	const worldBounds = world.getBounds();
	const { artboard } = world.get("artboard");

	const movement = createMovement({
		x : worldBounds.width / 2,
		y : worldBounds.height / 2,
		speed : SCALE_TO_SPEED[camera.getZoom()],
		canMoveTo : world.isInBounds,
	});

	camera.onCameraChange(() => {
		movement.setSpeed(SCALE_TO_SPEED[camera.getZoom()]);
	});

	const input = createInput({
		onInputChange(inputs) {
			const dirChanged = movement.setDir(
				resolveDirectionX(inputs),
				resolveDirectionY(inputs),
			);

			if(dirChanged) {
				// for ease of gridded movement, round out position whenever direction changes
				movement.setRoundedPosition();
			}
		},
	});

	camera.follow(movement);

	const tool = createTool({ artboard, movement : movement });

	return createEntity({
		id : "cursor",
		components : {
			input,
			movement,
			tool,
			render : {
				update(dt) {
					tool.render(dt);
				},
			},
		},
	});
};
