import { COLORS, COLOR_BLACK, TYPE_PALETTE, TYPE_RGBA } from "./render.consts.js";

import {
	intersectRects,
	unionRects,
	isEmptyRect,
} from "$util/math.js";

const RENDER_DEBUG = true;

/** @import { Renderable, Rect } from "./render.consts.js" */
/** @import { Color } from "./render.consts.js" */

const PALETTE_SIZE = 256;

const paletteRed = new Uint8ClampedArray(PALETTE_SIZE);
const paletteGreen = new Uint8ClampedArray(PALETTE_SIZE);
const paletteBlue = new Uint8ClampedArray(PALETTE_SIZE);
const paletteIsOpaque = new Uint8Array(PALETTE_SIZE);

for(const key of Object.keys(COLORS)) {
	const paletteIndex = Number(key);
	const color = COLORS[paletteIndex];

	paletteRed[paletteIndex] = color.r;
	paletteGreen[paletteIndex] = color.g;
	paletteBlue[paletteIndex] = color.b;
	paletteIsOpaque[paletteIndex] = color.a === 0 ? 0 : 1;
}

const getRenderableWidth = (renderable) =>
	renderable.type === TYPE_PALETTE ? renderable.width : renderable.imageData.width;

const getRenderableHeight = (renderable) =>
	renderable.type === TYPE_PALETTE ? renderable.height : renderable.imageData.height;

const getRenderableBounds = (renderable) => ({
	x : renderable.x,
	y : renderable.y,
	width : getRenderableWidth(renderable),
	height : getRenderableHeight(renderable),
});

export const createRenderer = (canvas, { width : canvasWidth, height : canvasHeight }) => {
	canvas.width = canvasWidth;
	canvas.height = canvasHeight;

	const ctx = canvas.getContext("2d");
	const frame = ctx.createImageData(canvasWidth, canvasHeight);
	const canvasBounds = { x : 0, y : 0, width : canvasWidth, height : canvasHeight };

	const backgroundColor = {
		r : paletteRed[COLOR_BLACK],
		g : paletteGreen[COLOR_BLACK],
		b : paletteBlue[COLOR_BLACK],
	};

	let previousRenderablesById = new Map();

	const renderer = {
		/**
		 * Paint background, default to entire canvas
		 * @param {Rect} [region]
		 * @returns {void}
		 */
		paintBackground(region = canvasBounds) {
			if(RENDER_DEBUG) {
				/* eslint-disable-next-line no-console */
				console.log("paint background", region, backgroundColor);
			}

			const regionRight = region.x + region.width;
			const regionBottom = region.y + region.height;

			for(let canvasY = region.y; canvasY < regionBottom; canvasY++) {
				let framePixelOffset = (canvasY * canvasWidth + region.x) * 4;

				for(let canvasX = region.x; canvasX < regionRight; canvasX++) {
					frame.data[framePixelOffset] = backgroundColor.r;
					frame.data[framePixelOffset + 1] = backgroundColor.g;
					frame.data[framePixelOffset + 2] = backgroundColor.b;
					frame.data[framePixelOffset + 3] = 255;
					framePixelOffset += 4;
				}
			}
		},

		/**
		 * @param {Rect} region
		 * @param {Renderable} renderable
		 */
		paintPaletteRenderable(region, renderable) {
			if(RENDER_DEBUG) {
				/* eslint-disable-next-line no-console */
				console.log("paint palette renderable", { region, renderable });
			}

			const { pixels, x : renderableX, y : renderableY, width : renderableWidth } = renderable;
			const regionRight = region.x + region.width;
			const regionBottom = region.y + region.height;

			for(let canvasY = region.y; canvasY < regionBottom; canvasY++) {
				const rowStartInRenderable = (canvasY - renderableY) * renderableWidth;
				let sourcePixelIndex = rowStartInRenderable + (region.x - renderableX);
				let framePixelOffset = (canvasY * canvasWidth + region.x) * 4;

				for(let canvasX = region.x; canvasX < regionRight; canvasX++) {
					const paletteIndex = pixels[sourcePixelIndex];

					if(paletteIsOpaque[paletteIndex]) {
						frame.data[framePixelOffset] = paletteRed[paletteIndex];
						frame.data[framePixelOffset + 1] = paletteGreen[paletteIndex];
						frame.data[framePixelOffset + 2] = paletteBlue[paletteIndex];
						frame.data[framePixelOffset + 3] = 255;
					}

					sourcePixelIndex += 1;
					framePixelOffset += 4;
				}
			}
		},

		/**
		 * @param {Rect} region
		 * @param {Renderable} renderable
		 */
		paintImageRenderable(region, renderable) {
			if(RENDER_DEBUG) {
				/* eslint-disable-next-line no-console */
				console.log("paint image renderable", { region, renderable });
			}

			const { imageData, x : renderableX, y : renderableY } = renderable;
			const sourceData = imageData.data;
			const sourceWidth = imageData.width;
			const regionRight = region.x + region.width;
			const regionBottom = region.y + region.height;

			for(let canvasY = region.y; canvasY < regionBottom; canvasY++) {
				const rowStartIdxInRenderable = (canvasY - renderableY) * sourceWidth * 4;
				let sourceByteOffset = rowStartIdxInRenderable + (region.x - renderableX) * 4;
				let framePixelOffset = (canvasY * canvasWidth + region.x) * 4;

				for(let canvasX = region.x; canvasX < regionRight; canvasX++) {
					if(sourceData[sourceByteOffset + 3] !== 0) {
						frame.data[framePixelOffset] = sourceData[sourceByteOffset];
						frame.data[framePixelOffset + 1] = sourceData[sourceByteOffset + 1];
						frame.data[framePixelOffset + 2] = sourceData[sourceByteOffset + 2];
						frame.data[framePixelOffset + 3] = 255;
					}

					sourceByteOffset += 4;
					framePixelOffset += 4;
				}
			}
		},

		/**
		 * Repaint `dirtyRegion` from scratch: clears it to the background, then composites every
		 * current renderable that overlaps it, back-to-front. Everything beneath a changed or removed
		 * renderable has to be repainted too, since the region was just cleared.
		 * @param {Rect} dirtyRegion
		 * @param {Renderable[]} renderables
		 */
		repaintDirtyRegion(dirtyRegion, renderables) {
			// due to transparent pixels we can't assume any layer actually fills the background correctly
			this.paintBackground(dirtyRegion);

			if(RENDER_DEBUG) {
				/* eslint-disable-next-line no-console */
				console.log("repaint dirty region", { dirtyRegion, renderables });
			}

			for(const renderable of renderables) {
				const overlap = intersectRects(dirtyRegion, getRenderableBounds(renderable));

				if(!overlap) {
					continue;
				}

				if(renderable.type === TYPE_PALETTE) {
					this.paintPaletteRenderable(overlap, renderable);
				} else if(renderable.type === TYPE_RGBA) {
					this.paintImageRenderable(overlap, renderable);
				}
			}
		},

		clearBackground() {
			previousRenderablesById.clear();

			this.paintBackground();

			ctx.putImageData(frame, 0, 0);
		},

		render(renderables) {
			if(RENDER_DEBUG) {
				/* eslint-disable-next-line no-console */
				console.log("render", { renderables });
			}

			const dirtyRects = [];
			const currentRenderablesById = new Map();

			for(const renderable of renderables) {
				const { id, type, x, y, dirty : dirtyHint } = renderable;
				const bounds = getRenderableBounds(renderable);
				const previous = previousRenderablesById.get(id);

				currentRenderablesById.set(id, {
					x,
					y,
					type,
					width : bounds.width,
					height : bounds.height,
				});

				if(!previous) {
					dirtyRects.push(bounds);

					continue;
				}

				const boundsChanged = previous.x !== x
					|| previous.y !== y
					|| previous.type !== type
					|| previous.width !== bounds.width
					|| previous.height !== bounds.height;

				if(boundsChanged) {
					dirtyRects.push({
						x : previous.x,
						y : previous.y,
						width : previous.width,
						height : previous.height,
					});
					dirtyRects.push(bounds);
				} else if(dirtyHint) {
					dirtyRects.push({
						x : x + dirtyHint.x,
						y : y + dirtyHint.y,
						width : dirtyHint.width,
						height : dirtyHint.height,
					});
				}
			}

			for(const [ id, previous ] of previousRenderablesById) {
				if(!currentRenderablesById.has(id)) {
					// present last frame but gone now: whatever was under it needs repainting
					dirtyRects.push({
						x : previous.x,
						y : previous.y,
						width : previous.width,
						height : previous.height,
					});
				}
			}

			previousRenderablesById = currentRenderablesById;

			const liveDirtyRects = dirtyRects.filter((rect) => !isEmptyRect(rect));

			if(liveDirtyRects.length === 0) {
				return;
			}

			const dirtyBounds = intersectRects(liveDirtyRects.reduce(unionRects), canvasBounds);

			if(!dirtyBounds) {
				return;
			}

			this.repaintDirtyRegion(dirtyBounds, renderables);

			ctx.putImageData(frame, 0, 0, dirtyBounds.x, dirtyBounds.y, dirtyBounds.width, dirtyBounds.height);
		},
	};

	renderer.clearBackground();

	return renderer;
};
