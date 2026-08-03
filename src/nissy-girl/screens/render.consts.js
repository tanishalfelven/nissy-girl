export const COLOR_WHITE = 1;
export const COLOR_BLACK = 0;
export const COLOR_TRANSPARENT = 255;

/** @typedef {{ r : number, g : number, b : number, a : number|undefined }} Color */

/**
 * @typedef {object} Rect
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 */

/**
 * @typedef {object} PaletteRenderable
 * @property {string} id
 * @property {"palette"} type
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 * @property {Uint8Array} pixels
 * @property {Rect | null} dirty
 */

/**
 * @typedef {object} ImageRenderable
 * @property {string} id
 * @property {"image"} type
 * @property {number} x
 * @property {number} y
 * @property {ImageData} imageData
 * @property {Rect | null} dirty
 */

/**
 * @typedef {PaletteRenderable | ImageRenderable} Renderable
 */

export const COLORS = {
	[COLOR_WHITE] : { r : 255, g : 255, b : 255 },
	[COLOR_BLACK] : { r : 0, g : 0, b : 0 },
	[COLOR_TRANSPARENT] : { r : 0, g : 0, b : 0, a : 0 },
};

export const TYPE_PALETTE = "palette";
export const TYPE_RGBA = "image";
