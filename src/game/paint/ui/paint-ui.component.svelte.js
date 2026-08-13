import { NOZOOM_FIXED } from "$game/shared/component/camera.js";

export const createPaintUIComponent = ({
	world,
} = false) => {
	const { camera } = world;

	let showUI = $state(false);

	const model = {
		get showUI() {
			return showUI;
		},
	};

	return {
		hasUpdate() {
			return camera.hasUpdate();
		},

		update() {
			showUI = camera.getZoomType() !== NOZOOM_FIXED;
		},

		getModel() {
			return model;
		},
	};
};
