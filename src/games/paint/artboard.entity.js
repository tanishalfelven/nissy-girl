import {
	COLOR_WHITE,
	TYPE_PALETTE,
} from "$nissy-girl/screens/render.consts.js";

import { CANVAS_HEIGHT, CANVAS_WIDTH } from "$nissy-girl/screens/screen.consts.js";

/**
 * @param {object} [options]
 * @param {number} [options.backgroundColor]
 * @param {number} options.width
 * @param {number} options.height
 * @returns {import("$games/shared/entity/scene.entity.js").Entity}
 */
export const createArtboard = ({
	backgroundColor = COLOR_WHITE,
	width = CANVAS_WIDTH,
	height = CANVAS_HEIGHT,
} = false) => {
	const pixels = new Uint8Array(width * height);

	pixels.fill(backgroundColor);

	return {
		id : "artboard",
		start() {},
		stop() {},
		hasUpdate() {},
		update() {},
		getRenderable() {
			return {
				id : "artboard",
				x : 0,
				y : 0,
				width,
				height,
				type : TYPE_PALETTE,
				pixels,
				dirty : null,
			};
		},
	};
};
