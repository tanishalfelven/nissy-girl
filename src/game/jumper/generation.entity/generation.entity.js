import { createEntity } from "$game/shared/entity/entity.js";
import { createCapabilities } from "./capabilities.component.js";
import { createGenerator } from "./generator.component.js";

export const createGeneration = ({ world }) => {
	const capabilities = createCapabilities({ world });

	return createEntity({
		id : "generation",
		components : {
			capabilities,
			generator : createGenerator({ capabilities }),
		},
	});
};
