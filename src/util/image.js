/**
 * @param {string} url
 * @returns {Promise<ImageData>}
 */
export const loadImageData = async (url) => {
	const image = new Image();

	image.src = url;
	await image.decode();

	const canvas = document.createElement("canvas");

	canvas.width = image.naturalWidth;
	canvas.height = image.naturalHeight;

	const ctx = canvas.getContext("2d");

	ctx.drawImage(image, 0, 0);

	return ctx.getImageData(0, 0, canvas.width, canvas.height);
};

/**
 * Loads a spritesheet and slices it into a fixed-size grid of frames
 * @param {string} url
 * @param {object} options
 * @param {number} options.frameWidth
 * @param {number} options.frameHeight
 * @returns {Promise<ImageData[]>}
 */
export const loadSpritesheetFrames = async (url, { frameWidth, frameHeight }) => {
	const image = new Image();

	image.src = url;
	await image.decode();

	const canvas = document.createElement("canvas");

	canvas.width = image.naturalWidth;
	canvas.height = image.naturalHeight;

	const ctx = canvas.getContext("2d");

	ctx.drawImage(image, 0, 0);

	const columns = Math.floor(canvas.width / frameWidth);
	const rows = Math.floor(canvas.height / frameHeight);
	const frames = [];

	for(let row = 0; row < rows; row++) {
		for(let column = 0; column < columns; column++) {
			frames.push(ctx.getImageData(column * frameWidth, row * frameHeight, frameWidth, frameHeight));
		}
	}

	return frames;
};
