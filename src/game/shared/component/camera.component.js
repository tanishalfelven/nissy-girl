import { CANVAS_WIDTH, CANVAS_HEIGHT } from "$nissy-girl/screens/screen.consts.js";
import { coordsDiffer } from "./position.js";

import { quadInOut } from "svelte/easing";
import { lerp } from "$util/math.js";

import {
	CAMERA,
	FIXED_1X_CAMERA,
	DEFAULT_PADDING,
	CAMERA_STYLE_FIXED,
	animateToPos,
} from "./camera.consts.js";

export const createCamera = ({
	world,
	width = CANVAS_WIDTH,
	height = CANVAS_HEIGHT,
	padding = DEFAULT_PADDING,
	leftPadding = padding,
	rightPadding = padding,
	topPadding = padding,
	bottomPadding = padding,
	config : inputConfig = FIXED_1X_CAMERA,
} = false) => {
	const { scale, position } = world.world.getRenderable();
	const subscribers = new Set();

	let configChanged = false;
	let config = inputConfig;

	// active movement component
	let target = false;
	// { x, y } of target postion
	let lastFollow = false;

	// animate to camera position, independent of target and takes precedence
	let animateToTarget = false;

	const animateTo = (dt) => {
		if(!animateToTarget) {
			return;
		}

		animateToTarget.elapsed = Math.min(
			animateToTarget.elapsed + dt,
			animateToTarget.duration,
		);

		const t = animateToTarget.elapsed / animateToTarget.duration;
		const eased = quadInOut(t);

		scale.x = lerp(
			eased,
			animateToTarget.fromZoom.x,
			animateToTarget.zoom.x,
		);

		scale.y = lerp(
			eased,
			animateToTarget.fromZoom.y,
			animateToTarget.zoom.y,
		);

		position.x = lerp(
			eased,
			animateToTarget.fromX,
			animateToTarget.targetX,
		);

		position.y = lerp(
			eased,
			animateToTarget.fromY,
			animateToTarget.targetY,
		);

		if(animateToTarget.elapsed >= animateToTarget.duration) {
			position.x = animateToTarget.targetX;
			position.y = animateToTarget.targetY;

			scale.x = animateToTarget.zoom.x;
			scale.y = animateToTarget.zoom.y;
		}
	};

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

		position.x = CAMERA[config.style].getX(
			width,
			config.zoom,
			pos.x,
			position.x,
			leftPadding,
			rightPadding,
		);

		position.y = CAMERA[config.style].getY(
			height,
			config.zoom,
			pos.y,
			position.y,
			topPadding,
			bottomPadding,
		);
	};

	const updateZoom = () => {
		if(!configChanged) {
			return;
		}

		scale.x = config.zoom;
		scale.y = config.zoom;
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

		animateTo({
			x,
			y,
			zoom,
			duration = 300,
		}) {
			animateToTarget = {
				duration,
				elapsed : 0,
				zoom,
				fromZoom : { x : scale.x, y : scale.y },
				fromX : position.x,
				fromY : position.y,

				targetX : animateToPos.getX(width, zoom.x, x),
				targetY : animateToPos.getY(height, zoom.y, y),
			};
		},

		cameraToScreen(posX, posY) {
			return {
				x : posX * scale.x + position.x,
				y : posY * scale.y + position.y,
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

		getScale() {
			return scale;
		},

		getZoom() {
			return config.zoom;
		},

		getIsFixedStyle() {
			return config.style === CAMERA_STYLE_FIXED;
		},

		update(dt) {
			if(animateToTarget) {
				animateTo(dt);

				return;
			}

			updateZoom();

			setTransform(dt);
		},
	};
};
