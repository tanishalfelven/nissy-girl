import { createEntity } from "$game/shared/entity/entity.js";

import { createRender } from "./render.component.js";
import { createBounds } from "./bounds.component.js";

export const createPlatforms = ({
	world,
}) => {
	const { generation } = world.world.getContext();

	const { platforms } = generation.maps.daily;
	const bounds = world.world.getBounds();

	return createEntity({
		id : "platforms",
		components : {
			bounds : createBounds({ platforms, bounds }),
			render : createRender({ platforms, bounds }),
		},
	});
};
