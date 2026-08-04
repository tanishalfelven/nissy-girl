import { CANVAS_HEIGHT, CANVAS_WIDTH } from "$nissy-girl/screens/screen.consts.js";

import { COLOR_WHITE, COLOR_BLACK } from "$nissy-girl/screens/render.consts.js";

import { GraphicsContext, Graphics } from "pixi.js";

const createCoords = (x = 0, y = 0) => ({ x, y });
const clearCoords = (pos) => {
	pos.x = 0;
	pos.y = 0;
};
const coordsDiffer = (a, b) => (a.x !== b.x || a.y !== b.y);

/**
 * @param {object} [options]
 * @param {number} [options.backgroundColor]
 * @param {number} options.width
 * @param {number} options.height
 * @returns {import("$game/shared/entity/scene.entity.js").Entity}
 */
export const createArtboard = ({
	backgroundColor = COLOR_WHITE,
	width = CANVAS_WIDTH,
	height = CANVAS_HEIGHT,
} = false) => {
	const pixels = new GraphicsContext()
		.rect(0, 0, width, height)
		.fill(backgroundColor);

	const renderable = new Graphics(pixels);

	let isDrawing = false;
	const pos = [];

	return {
		id : "artboard",
		getRenderable() {
			return renderable;
		},
		start() {},
		stop() {},
		hasUpdate() {
			return isDrawing || pos.length;
		},
		update(dt, entities) {
			const cursor = entities.get("cursor");

			if(cursor && isDrawing) {
				pos.push(cursor.getPosition());
			}
		},
		send(event) {
			if(event.type === "PEN_DOWN") {
				isDrawing = true;

				return;
			}

			if(event.type === "PEN_UP") {
				isDrawing = false;

				return;
			}
		},
		destroy() {
			pixels.destroy();
		},
		render() {
			if(isDrawing || pos.length) {
				for(let i = 0; i < pos.length; i++) {
					const first = pos[i];
					const second = pos[i + 1];

					if(first && second) {
						pixels.moveTo(first.x, first.y)
							.lineTo(second.x, second.y)
							.stroke({ color : COLOR_BLACK, pixelLine : true });
					}
				}

				pos.slice(0, pos.length - 2);
			}

			if(!isDrawing) {
				pos.length = 0;
			}
		},
	};
};
