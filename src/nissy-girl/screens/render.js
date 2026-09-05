import "pixi.js/graphics";
import "pixi.js/particle-container";

import { WebGLRenderer, TextureStyle, Assets } from "pixi.js";

import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./screen.consts.js";

import { COLOR_OFF_BLACK } from "./render.consts.js";

import { getCanvas } from "./screen.svelte";

/** @import { Renderer } from "pixi.js"; */

/** @type {Renderer} */
let renderer = false;
let rendererPromise = false;

const createRenderer = async (canvas, { width = CANVAS_WIDTH, height = CANVAS_HEIGHT }) => {
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

		skipExtensionImports : true,
	});

	renderer.clear();

	return renderer;
};

export const initRenderer = async () => {
	if(rendererPromise) {
		return rendererPromise;
	}

	rendererPromise = (async () => {
		const canvas = getCanvas();

		if(!canvas) {
			throw new Error("Catastrophic: no canvas available.");
		}

		renderer = await createRenderer(canvas, { width : CANVAS_WIDTH, height : CANVAS_HEIGHT });

		await Assets.init();

		return renderer;
	})();

	return rendererPromise;
};

export const screen = {
	render(renderables) {
		if(!renderer) {
			throw new Error("Render scene called before renderer init!");
		}

		if(!renderables) {
			/* eslint-disable-next-line no-console -- debug */
			console.warn("Tried to render falsey input", renderables);

			return false;
		}

		renderer.render(renderables);
	},

	clear() {
		if(!renderer) {
			throw new Error("Clear scene called before renderer init!");
		}

		renderer.clear({ clearColor : COLOR_OFF_BLACK });
	},

	isReady() {
		return Boolean(renderer);
	},
};
