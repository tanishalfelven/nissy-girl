import { CANVAS_WIDTH, CANVAS_HEIGHT } from "$nissy-girl/screens/screen.consts.js";

import {
	CAMERA,
	FIXED_1X_CAMERA,
	DEFAULT_PADDING,
	CAMERA_STYLE_FIXED,
} from "./camera.consts.js";

import { coordsDiffer } from "./position.js";

export const createCamera = ({
	world,
	width = CANVAS_WIDTH,
	height = CANVAS_HEIGHT,
	padding = DEFAULT_PADDING,
	config : inputConfig = FIXED_1X_CAMERA,
} = false) => {
	const renderable = world.world.getRenderable();
	const subscribers = new Set();

	let configChanged = false;
	let config = inputConfig;

	let target = false;
	let lastFollow = false;

	const setTransform = () => {
		if(!configChanged && !target) {
			return;
		}

		const pos = target.getPosition();

		if(!configChanged && !coordsDiffer(lastFollow, pos)) {
			return;
		}

		lastFollow = pos;
		configChanged = false;

		renderable.position.x = CAMERA[config.style].getX(
			width,
			config.zoom,
			pos.x,
			renderable.position.x,
			padding,
		);

		renderable.position.y = CAMERA[config.style].getY(
			height,
			config.zoom,
			pos.y,
			renderable.position.y,
			padding,
		);
	};

	const updateZoom = () => {
		if(!configChanged) {
			return;
		}

		renderable.scale.x = config.zoom;
		renderable.scale.y = config.zoom;
	};

	return {
		hasUpdate() {
			return (target && target.isMoving())
				|| configChanged;
		},

		follow(movement) {
			target = movement;

			setTransform();
		},

		cameraToScreen(posX, posY) {
			return {
				x : posX * config.zoom + renderable.position.x,
				y : posY * config.zoom + renderable.position.y,
			};
		},

		onCameraChange(subscriber) {
			subscribers.add(subscriber);

			return () => subscribers.delete(subscriber);
		},

		setCameraConfig(newCameraConfig) {
			configChanged = newCameraConfig.zoom !== config.zoom
				|| newCameraConfig.style !== config.style;

			config = newCameraConfig;

			for(const subscriber of subscribers) {
				subscriber(config);
			}
		},

		getZoom() {
			return config.zoom;
		},

		getIsFixedStyle() {
			return config.style === CAMERA_STYLE_FIXED;
		},

		update() {
			updateZoom();

			setTransform();
		},
	};
};
