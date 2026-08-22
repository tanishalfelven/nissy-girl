export const DEFAULT_PADDING = 45;

export const CAMERA_STYLE_FIXED = 0;
export const CAMERA_STYLE_PAN = 1;
export const CAMERA_STYLE_PAN_PADDED = 2;

export const FIXED_1X_CAMERA = { zoom : 1, style : CAMERA_STYLE_FIXED };
export const PADPAN_1X_CAMERA = { zoom : 1, style : CAMERA_STYLE_PAN_PADDED };
export const PAN_3X_CAMERA = { zoom : 3, style : CAMERA_STYLE_PAN };

const fixedCamera = {
	getX : (width, zoom) => width * (1 - zoom) / 2,
	getY : (height, zoom) => height * (1 - zoom) / 2,
};

const panCamera = {
	getX : (width, zoom, x) => -x * zoom + width / 2,
	getY : (height, zoom, y) => -y * zoom + height / 2,
};

const panPaddedCamera = {
	getX : (width, zoom, x, cameraX, leftPadding, rightPadding) => {
		const screenX = x + cameraX;
		const minX = leftPadding * zoom;
		const maxX = width - rightPadding * zoom;

		if(screenX < minX) {
			return cameraX + minX - screenX;
		} else if(screenX > maxX) {
			return cameraX + maxX - screenX;
		}

		return cameraX;
	},
	getY : (height, zoom, y, cameraY, topPadding, bottomPadding) => {
		const screenY = y + cameraY;
		const minY = topPadding * zoom;
		const maxY = height - bottomPadding * zoom;

		if(screenY < minY) {
			return cameraY + minY - screenY;
		} else if(screenY > maxY) {
			return cameraY + maxY - screenY;
		}

		return cameraY;
	},
};

export const CAMERA = {
	[CAMERA_STYLE_FIXED] : fixedCamera,
	[CAMERA_STYLE_PAN] : panCamera,
	[CAMERA_STYLE_PAN_PADDED] : panPaddedCamera,
};
