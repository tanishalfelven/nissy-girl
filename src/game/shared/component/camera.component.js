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

		const targetX = animateToPos.getX(width, animateToTarget.x);
		const targetY = animateToPos.getY(height, animateToTarget.y);

		position.x = lerp(
			eased,
			animateToTarget.fromX,
			targetX,
		);

		position.y = lerp(
			eased,
			animateToTarget.fromY,
			targetY,
		);

		if(animateToTarget.elapsed >= animateToTarget.duration) {
			position.x = targetX;
			position.y = targetY;
		}
	};

	const setTransform = (dt) => {
		if(animateToTarget) {
			animateTo(dt);

			return;
		}

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

		getWorldX() {
			return -position.x;
		},

		getWorldY() {
			return -position.y;
		},

		follow(movement) {
			target = movement;

			setTransform();
		},

		animateTo({
			x,
			y,
			duration = 300,
		}) {
			animateToTarget = {
				x,
				y,
				duration,
				elapsed : 0,
				fromX : position.x,
				fromY : position.y,
			};
		},

		cameraToScreen(posX, posY) {
			return {
				x : posX * config.zoom + position.x,
				y : posY * config.zoom + position.y,
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

		update(dt) {
			updateZoom();

			setTransform(dt);
		},
	};
};
