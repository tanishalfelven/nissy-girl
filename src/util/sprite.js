/**
 * @typedef {object} Sprite
 * @property {(key: number|string) => void} setFrame
 * @property {() => ImageData} getCurrentFrame
 */

/**
 * @param {ImageData[] | Record<string, ImageData>} frames
 * @param {object} [options]
 * @param {number|string} [options.initial]
 * @returns {Sprite}
 */
export const createSprite = (frames, { initial = 0 } = {}) => {
	let currentKey = initial;

	return {
		setFrame(key) {
			currentKey = key;
		},
		getCurrentFrame() {
			return frames[currentKey];
		},
	};
};
