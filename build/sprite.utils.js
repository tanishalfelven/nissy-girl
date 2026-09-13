export const normalizeFrame = (frame, filename) => {
	const { w, h } = frame.frame;

	// TODO delete a bunch of data in a frame, it could be big data savings
	if(filename && filename !== frame.filename) {
		frame.filename = filename;
	}

	frame.trimmed = false;
	frame.spriteSourceSize.x = 0;
	frame.spriteSourceSize.y = 0;
	frame.spriteSourceSize.w = w;
	frame.spriteSourceSize.h = h;
	frame.sourceSize.w = w;
	frame.sourceSize.h = h;

	return frame;
};

export const isTextureLayer = (layer) => "blendMode" in layer;

export const subtractPosition = (position, origin) => ({
	x : position.x - origin.x,
	y : position.y - origin.y,
});

export const getFramePosition = (frame) => ({
	x : frame.spriteSourceSize.x,
	y : frame.spriteSourceSize.y,
});
