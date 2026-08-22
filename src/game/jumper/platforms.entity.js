import { createEntity } from "$game/shared/entity/entity.js";

import { COLOR_RED } from "$nissy-girl/screens/render.consts.js";

import { inRange } from "$util/math.js";

import { Graphics } from "pixi.js";

export const wrapsRight = (x) => x < 0;
export const wrapsLeft = (x, bounds) => x > bounds.width;

const isOutOfBounds = (platform, bounds) => {
	return wrapsLeft(platform.x + platform.width, bounds) || wrapsRight(platform.x);
};

const matchesX = (platformX, platformWidth, targetX, targetWidth) => {
	return inRange(targetX, platformX - targetWidth, platformX + platformWidth);
};

const fallsOnPlatform = (platformY, startY, targetY) => {
	return inRange(platformY, startY, targetY) && platformY <= targetY;
};

export const createPlatforms = ({
	world,
}) => {
	const { generation } = world.world.getContext();

	const map = generation.maps.gen_test;
	const bounds = world.world.getBounds();

	const graphics = new Graphics();

	const movesThroughPlatform = (platform, startX, startY, targetX, targetY, width) => {
		const checkWrap = isOutOfBounds(platform, bounds);
		const wrapOffset = wrapsRight(platform.x) ? bounds.width : -bounds.width;

		const isValidWrap = checkWrap && matchesX(platform.x + wrapOffset, platform.width, targetX, width);

		if(!matchesX(platform.x, platform.width, targetX, width) && !isValidWrap) {
			return false;
		}

		return fallsOnPlatform(platform.y, startY, targetY);
	};

	return createEntity({
		id : "platforms",
		components : {
			bounds : {
				getSpawn() {
					const startPlatform = map[0];

					return { x : startPlatform.x + 5, y : startPlatform.y };
				},

				remainsGrounded(index, x, y, width) {
					const platform = map[index];

					return movesThroughPlatform(platform, x, y, x, y, width) !== false;
				},

				moveIntersectsPlatform(startX, startY, targetX, targetY, width) {
					let finalX = targetX;
					let finalY = targetY;
					let needleIndex = -1;

					// its falling platforms so we can make a bunch of assumptions
					// we take the lowest value and return that
					for(let index = 0; index < map.length; index++) {
						const platform = map[index];

						if(movesThroughPlatform(
							platform,
							startX,
							startY,
							targetX,
							targetY,
							width,
						)) {
							finalY = platform.y;
							needleIndex = index;
						}
					}

					return { x : finalX, y : finalY, index : needleIndex };
				},
			},
			render : {
				update() {
					graphics.clear();

					for(const platform of map) {
						graphics
							.rect(platform.x, platform.y, platform.width, platform.height)
							.fill(COLOR_RED);

						if(platform.x < 0) {
							graphics
								.rect(platform.x + bounds.width, platform.y, platform.width, platform.height)
								.fill(COLOR_RED);
						} else if(platform.x + platform.width > bounds.width) {
							graphics
								.rect(platform.x - bounds.width, platform.y, platform.width, platform.height)
								.fill(COLOR_RED);
						}
					}
				},

				getRenderable() {
					return graphics;
				},

				destroy() {
					graphics.destroy();
				},
			},
		},
	});
};
