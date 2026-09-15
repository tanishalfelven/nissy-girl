import {
	FACE_FRONT,
	FACE_REAR,
	FACE_LEFT,
	FACE_RIGHT,
	FACES,
} from "../skeleton.consts.js";

import { createDepthResolver } from "./depth.resolver.js";
import { createSideResolver } from "./side.resolver.js";

export const createSkeletonResolver = (faces) => {
	const resolvers = {
		[FACE_FRONT] : createDepthResolver({ face : faces[FACE_FRONT] }),
		[FACE_REAR] : createDepthResolver({ face : faces[FACE_REAR] }),
		[FACE_LEFT] : createSideResolver({ face : faces[FACE_LEFT] }),
		[FACE_RIGHT] : createSideResolver({ face : faces[FACE_RIGHT] }),
	};

	return {
		update(face, values) {
			resolvers[face].update(values);
		},

		load() {
			return Promise.all(
				FACES.map((faceId) => resolvers[faceId].load()),
			);
		},
	};
};
