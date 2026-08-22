import { inRange } from "$util/math.js";

export const wrapsRight = (x) => x < 0;
export const wrapsLeft = (x, bounds) => x > bounds.width;

export const isOutOfBounds = (platform, bounds) => {
	return wrapsLeft(platform.x + platform.width, bounds) || wrapsRight(platform.x);
};

export const matchesX = (platformX, platformWidth, targetX, targetWidth) => {
	return inRange(targetX, platformX - targetWidth, platformX + platformWidth);
};

export const fallsOnPlatform = (platformY, startY, targetY) => {
	return inRange(platformY, startY, targetY) && platformY <= targetY;
};

export const movesThroughPlatform = (platform, startX, startY, targetX, targetY, width, bounds) => {
	const checkWrap = isOutOfBounds(platform, bounds);
	const wrapOffset = wrapsRight(platform.x) ? bounds.width : -bounds.width;

	const isValidWrap = checkWrap && matchesX(platform.x + wrapOffset, platform.width, targetX, width);

	if(!matchesX(platform.x, platform.width, targetX, width) && !isValidWrap) {
		return false;
	}

	return fallsOnPlatform(platform.y, startY, targetY);
};

export const findIntersectionInZone = (startX, startY, targetX, targetY, width, zone, bounds) => {
	let finalX = targetX;
	let finalY = targetY;
	let needleIndex = -1;

	// zone can be undefined, in which case noop
	if(zone) {
		// its falling platforms so we can make a bunch of assumptions
		// we take the lowest value and return that
		for(let index = 0; index < zone.length; index++) {
			const { platform, platformIndex } = zone[index];

			if(movesThroughPlatform(
				platform,
				startX,
				startY,
				targetX,
				targetY,
				width,
				bounds,
			)) {
				finalY = platform.y;
				needleIndex = platformIndex;
			}
		}
	}

	return {
		x : finalX,
		y : finalY,
		index : needleIndex,
	};
};
