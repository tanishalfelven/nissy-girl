import { CANVAS_HEIGHT, CANVAS_WIDTH } from "$nissy-girl/screens/screen.consts.js";

import { RenderTexture, GraphicsContext, Graphics, Sprite } from "pixi.js";

import { screen } from "$nissy-girl/screens/screen.svelte";

/** @import { Container } from "pixi.js" */
/** @import { ContainerComponent } from "$game/shared/entity/world.entity.js" */

import { COLOR_WHITE } from "$nissy-girl/screens/render.consts.js";

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

const createArtboardRender = ({
	width = CANVAS_WIDTH,
	height = CANVAS_HEIGHT,
	pixels,
}) => {
	const artboardTexture = RenderTexture.create({
		width,
		height,
		antialias : false,
	});

	artboardTexture.source.scalemode = "nearest";

	const sprite = new Sprite(artboardTexture);

	const renderable = new Graphics(pixels);

	return ({
		update() {
			screen.render({
				container : renderable,
				target : artboardTexture,
			});
		},
		getRenderable() {
			return sprite;
		},
	});
};

/**
 * @param {object} options
 * @param {import("$game/shared/entity/world.entity.js").WorldEntity} options.world
 * @returns {import("$game/shared/entity/entity.js").Entity}
 */
export const createArtboard = ({ world }) => {
	const { width, height } = world.camera.getBounds();

	const pixels = new GraphicsContext();

	const artboard = createEntity({
		id : "artboard",
		components : {
			artboard : createArtboardComponent({ pixels }),
			render : createArtboardRender({ pixels, width, height }),
		},
	});

	artboard.artboard.clear();

	return artboard;
};
