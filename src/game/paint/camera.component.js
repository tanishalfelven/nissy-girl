import {
	createCamera,
} from "$game/shared/component/camera.component.js";

import {
	FIXED_1X_CAMERA,
	PADPAN_1X_CAMERA,
	PAN_3X_CAMERA,
} from "$game/shared/component/camera.consts.js";

import { wrap } from "$util/math.js";

const DEFAULT_CAMERA = 0;

const PAINT_CAMERA_ORDER = [
	PADPAN_1X_CAMERA,
	PAN_3X_CAMERA,
	FIXED_1X_CAMERA,
];

export const createPaintCamera = ({
	world,
}) => {
	let cameraIdx = DEFAULT_CAMERA;

	const camera = createCamera({
		world,
		config : PAINT_CAMERA_ORDER[cameraIdx],
	});

	return {
		// taking advantage of the fact that lifecycle methods of components never
		// expect to be bound to this - using this sparingly
		...camera,

		stepZoom() {
			cameraIdx = wrap(cameraIdx + 1, 0, PAINT_CAMERA_ORDER.length);

			camera.setCameraConfig(PAINT_CAMERA_ORDER[cameraIdx]);
		},
	};
};
