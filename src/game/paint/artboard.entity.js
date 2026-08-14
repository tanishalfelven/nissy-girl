/** @import { Container } from "pixi.js" */
/** @import { ContainerComponent } from "$game/shared/entity/world.entity.js" */

import { createEntity } from "$game/shared/entity/entity.js";

import { PixelCanvas } from "./util/pixels.js";

const createArtboardComponent = ({
	pixels,
}) => {
	return ({
		clear() {
			pixels.clear();

			return true;
		},

		getContext() {
			return pixels;
		},
	});
};

const createArtboardRender = ({ pixels }) => {
	return ({
		update() {
			pixels.update();
		},
		getRenderable() {
			return pixels.sprite;
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

	const pixels = new PixelCanvas({ width, height });

	const artboard = createEntity({
		id : "artboard",
		components : {
			artboard : createArtboardComponent({ pixels }),
			render : createArtboardRender({ pixels }),
		},
	});

	artboard.artboard.clear();

	return artboard;
};
