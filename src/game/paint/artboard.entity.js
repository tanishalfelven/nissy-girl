/** @import { Container } from "pixi.js" */
/** @import { ContainerComponent } from "$game/shared/entity/world.entity.js" */

import { createEntity } from "$game/shared/entity/entity.js";
import { COLOR_WHITE } from "./util/colors.js";

import { PixelCanvas } from "./util/pixels.js";

const createArtboardComponent = ({
	pixels,
}) => {
	return ({
		clear(commit = true) {
			pixels.clear(COLOR_WHITE, { commit });

			return true;
		},

		getContext() {
			return pixels;
		},

		getHasUndo() {
			return pixels.hasUndo();
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
	const { width, height } = world.world.getBounds();

	const pixels = new PixelCanvas({ width, height });

	const artboard = createEntity({
		id : "artboard",
		components : {
			artboard : createArtboardComponent({ pixels }),
			render : createArtboardRender({ pixels }),
		},
	});

	artboard.artboard.clear(false);

	return artboard;
};
