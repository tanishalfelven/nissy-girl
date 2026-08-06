import { CANVAS_HEIGHT, CANVAS_WIDTH } from "$nissy-girl/screens/screen.consts.js";

import { COLOR_WHITE } from "$nissy-girl/screens/render.consts.js";

import { GraphicsContext, Graphics } from "pixi.js";

import { createWorld } from "$game/shared/entity/world.entity.js";

/**
 * @param {object} [options]
 * @param {number} [options.backgroundColor]
 * @param {number} options.width
 * @param {number} options.height
 * @returns {import("$game/shared/entity/world.entity.js").WorldEntity}
 */
export const createArtboard = ({
	backgroundColor = COLOR_WHITE,
	width : artboardWidth = CANVAS_WIDTH,
	height : artboardHeight = CANVAS_HEIGHT,
} = false) => {
	const world = createWorld({
		id : "artboard",
	});

	const pixels = new GraphicsContext();

	const renderable = new Graphics(pixels);

	world.getRenderable().addChild(renderable);

	world.artboard = {
		getContext() {
			return pixels;
		},
		clear() {
			pixels
				.rect(0, 0, artboardWidth, artboardHeight)
				.fill(backgroundColor);
		},
	};

	let cursor;

	Object.defineProperty(world, "cursor", {
		get() {
			if(!cursor) {
				for(const entity of world.getEntities()) {
					if(entity.id === "cursor") {
						cursor = entity;
					}
				}
			}

			return cursor;
		},
		enumerable : true,
	});

	world.artboard.clear();

	return world;
};
