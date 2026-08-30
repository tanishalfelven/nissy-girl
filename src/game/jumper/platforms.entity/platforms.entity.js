import { createEntity } from "$game/shared/entity/entity.js";

import { createRender } from "./render.component.js";
import { createBounds } from "./bounds.component.js";

export const createPlatforms = ({
	world,
}) => {
	const { generation, selected } = world.world.getContext();

	const { platforms } = generation.maps[selected];
	const worldBounds = world.world.getBounds();

	const bounds = createBounds({ platforms, worldBounds });

	const startPlatform = bounds.getStartPlatform();

	// make camera never show under start platform
	world.camera.setMinY(startPlatform.height);

	return createEntity({
		id : "platforms",
		components : {
			bounds,
			render : createRender({ platforms, bounds, world, worldBounds }),
		},
	});
};
