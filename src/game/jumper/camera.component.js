import { createCamera } from "$game/shared/component/camera.component.js";
import { cameraConfig, CAMERA_STYLE_PAN_PADDED } from "$game/shared/component/camera.consts.js";

export const createJumperCamera = ({
	world,
}) => {
	let minY = false;

	const beforeAssignY = (cameraY) => {
		if(minY === false) {
			return cameraY;
		} else if(cameraY < minY) {
			return Math.max(cameraY, minY);
		}

		return cameraY;
	};

	const camera = createCamera({
		world,
		config : cameraConfig({
			zoom : 1,
			style : CAMERA_STYLE_PAN_PADDED,
			interpolateY : true,
		}),
		leftPadding : -5,
		rightPadding : -5,
		topPadding : 50,
		bottomPadding : 15,

		beforeAssignY,
	});

	camera.setMinY = (newMinY) => {
		minY = newMinY;
	};

	return camera;
};
