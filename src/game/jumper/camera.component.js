import { createCamera } from "$game/shared/component/camera.component.js";
import { PADPAN_1X_CAMERA } from "$game/shared/component/camera.consts.js";

export const createJumperCamera = ({
	world,
}) => {
	return createCamera({
		world,
		config : PADPAN_1X_CAMERA,
		leftPadding : 0,
		rightPadding : 0,
		topPadding : 50,
		bottomPadding : 15,
	});
};
