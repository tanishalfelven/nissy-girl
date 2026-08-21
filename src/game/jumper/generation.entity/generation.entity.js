import { createEntity } from "$game/shared/entity/entity.js";
import { createCapabilities } from "./capabilities.component.js";

export const createGeneration = ({ world }) => {
	const generation = createEntity({
		id : "generation",
		components : {
			capabilities : createCapabilities({ world }),
		},
	});

	return generation;
};
