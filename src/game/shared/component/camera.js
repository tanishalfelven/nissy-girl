import { CANVAS_WIDTH, CANVAS_HEIGHT } from "$nissy-girl/screens/screen.consts.js";

import { wrap } from "$util/math.js";

import { coordsDiffer } from "./position.js";

const PADDING = 45;

export const NOZOOM_FIXED = 0;
export const NOZOOM_WITH_PAN = 1;

export const DEFAULT_ZOOM = NOZOOM_WITH_PAN;

const ZOOM_STEPS = new Map([
	[ NOZOOM_FIXED, 1 ],
	[ NOZOOM_WITH_PAN, 1 ],
	[ 2, 3 ],
]);

export const createCamera = ({
	world,
	width = CANVAS_WIDTH,
	height = CANVAS_HEIGHT,
	padding = PADDING,
} = false) => {
	let x = 0;
	let y = 0;

	let zoomChanged = false;
	let zoom = DEFAULT_ZOOM;
	let zoomScale = ZOOM_STEPS.get(zoom);

	const renderable = world.world.getRenderable();

	const minX = padding * zoomScale;
	const minY = padding * zoomScale;
	const maxX = width - padding * zoomScale;
	const maxY = height - padding * zoomScale;

	let target = false;

	let lastFollow = false;

	const setPanningWithPadding = (pos) => {
		const screenX = pos.x + x;

		if(screenX < minX) {
			x += minX - screenX;
		} else if(screenX > maxX) {
			x -= screenX - maxX;
		}

		const screenY = pos.y + y;

		if(screenY < minY) {
			y += minY - screenY;
		} else if(screenY > maxY) {
			y -= screenY - maxY;
		}
	};

	const setFixedTransform = () => {
		x = width * (1 - zoomScale) / 2;
		y = height * (1 - zoomScale) / 2;
	};

	const followMovement = (pos) => {
		// keep the cursor centered when zoomed in
		x = -pos.x * zoomScale + width / 2;
		y = -pos.y * zoomScale + height / 2;
	};

	const setTransform = (didZoom) => {
		if(!target && !didZoom) {
			return;
		}

		const pos = target.getPosition();

		if(!coordsDiffer(lastFollow, pos) && !didZoom) {
			return false;
		}

		lastFollow = pos;
		zoomChanged = false;

		if(zoom <= NOZOOM_FIXED) {
			setFixedTransform();
		} else if(zoom === NOZOOM_WITH_PAN) {
			setPanningWithPadding(pos);
		} else if(zoom >= 2) {
			followMovement(pos);
		}

		renderable.position.x = Math.round(x);
		renderable.position.y = Math.round(y);
	};

	const setZoom = () => {
		if(!zoomChanged) {
			return;
		}

		zoomScale = ZOOM_STEPS.get(zoom);

		renderable.scale.x = zoomScale;
		renderable.scale.y = zoomScale;

		return true;
	};

	return {
		hasUpdate() {
			return (Boolean(target)
				&& lastFollow
				&& coordsDiffer(lastFollow, target.getPosition()))
			|| zoomChanged;
		},

		follow(movement) {
			target = movement;

			setTransform(target.getPosition());
		},

		inBounds(x, y) {
			return x >= 0 && x <= (width - 1) && y >= 0 && y <= (height - 1);
		},

		getBounds() {
			return { width, height };
		},

		getPosition() {
			return { x, y };
		},

		cameraToScreen(cameraX, cameraY) {
			return {
				x : cameraX * zoomScale + x,
				y : cameraY * zoomScale + y,
			};
		},

		stepZoom(dir = 1) {
			const newZoom = wrap(zoom + dir, 0, ZOOM_STEPS.size);

			if(ZOOM_STEPS.has(newZoom)) {
				zoom = newZoom;

				zoomChanged = true;
			}
		},

		getZoomScale() {
			return zoomScale;
		},

		getZoomType() {
			return zoom;
		},

		update() {
			const didZoom = setZoom();

			return setTransform(didZoom);
		},
	};
};
