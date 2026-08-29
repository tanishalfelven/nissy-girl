import { createCamera } from "$game/shared/component/camera.component.js";
import { cameraConfig, CAMERA_STYLE_PAN_PADDED } from "$game/shared/component/camera.consts.js";

export const createJumperCamera = ({
	world,
}) => {
	return createCamera({
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
	});
};
