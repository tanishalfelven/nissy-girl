const COLOR_WHITE = 1;
const COLOR_BLACK = 0;
const COLOR_TRANSPARENT = 255;

const COLORS = {
	[COLOR_WHITE] : { r : 255, g : 255, b : 255 },
	[COLOR_BLACK] : { r : 0, g : 0, b : 0 },
	[COLOR_TRANSPARENT] : { r : 255, g : 255, b : 255, a : 255 },
};

export const createRenderer = (canvas, { width, height }) => {
	canvas.width = width;
	canvas.height = height;

	const ctx = canvas.getContext("2d", { alpha : false });

	ctx.width = width;
	ctx.height = height;

	const transient = new Uint8Array(width * height);
	const committed = new Uint8Array(width * height);

	transient.fill(COLOR_TRANSPARENT);
	committed.fill(COLOR_WHITE);

	const content = ctx.createImageData(width, height);

	return {
		render() {
			for(let i = 0; i < committed.length; i++) {
				const contentIdx = i * 4;

				const transientColor = transient[i];
				const committedColor = committed[i];

				const {
					r = 255,
					g = 255,
					b = 255,
					a = 255,
				} = COLORS[(transientColor === COLOR_TRANSPARENT
					? committedColor
					: transientColor)];

				content.data[contentIdx + 0] = r;
				content.data[contentIdx + 1] = g;
				content.data[contentIdx + 2] = b;
				content.data[contentIdx + 3] = a;
			}

			ctx.putImageData(content, 0, 0);
		},
	};
};
