import { createEntity } from "$game/shared/entity/entity.js";

import { createRender } from "./render.component.js";
import { createBounds } from "./bounds.component.js";

export const createPlatforms = ({
	world,
}) => {
	const { generation } = world.world.getContext();

	const map = generation.maps.gen_test;
	const bounds = world.world.getBounds();

	return createEntity({
		id : "platforms",
		components : {
			bounds : createBounds({ map, bounds }),
			render : createRender({ map, bounds }),
		},
	});
};
