import { CANVAS_HEIGHT, CANVAS_WIDTH } from "$nissy-girl/screens/screen.consts.js";

/** @import { Container } from "pixi.js" */
/** @import { ContainerComponent } from "$game/shared/entity/world.entity.js" */

import { COLOR_WHITE } from "$nissy-girl/screens/render.consts.js";

import { GraphicsContext, Graphics } from "pixi.js";

import { createEntity } from "$game/shared/entity/entity.js";

const createArtboardComponent = ({
	pixels,
	backgroundColor = COLOR_WHITE,
	width = CANVAS_WIDTH,
	height = CANVAS_HEIGHT,
}) => {
	return ({
		clear() {
			pixels
				.clear()
				.rect(0, 0, width, height)
				.fill(backgroundColor);

			return true;
		},
		getContext() {
			return pixels;
		},
	});
};

/**
 * @returns {import("$game/shared/entity/entity.js").Entity}
 */
export const createArtboard = () => {
	const pixels = new GraphicsContext();

	const renderable = new Graphics(pixels);

	const artboard = createEntity({
		id : "artboard",
		components : {
			artboard : createArtboardComponent({ pixels }),
			render : {
				getRenderable() {
					return renderable;
				},
			},
		},
	});

	artboard.artboard.clear();

	return artboard;
};
