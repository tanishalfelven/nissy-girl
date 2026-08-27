import { WebGLRenderer, TextureStyle } from "pixi.js";

import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./screen.consts.js";

import { COLOR_OFF_BLACK } from "./render.consts.js";

export const createRenderer = async (canvas, { width = CANVAS_WIDTH, height = CANVAS_HEIGHT }) => {
	TextureStyle.defaultOptions.scaleMode = "nearest";

	const renderer = new WebGLRenderer();

	await renderer.init({
		canvas,
		width,
		height,
		backgroundAlpha : 1,
		backgroundColor : COLOR_OFF_BLACK,
		// have you heard of pixel art
		antialias : false,
	});

	renderer.clear();

	return renderer;
};
