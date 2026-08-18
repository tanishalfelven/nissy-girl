import { createEntity } from "$game/shared/entity/entity.js";

import { COLOR_RED } from "$nissy-girl/screens/render.consts.js";

import { inRange } from "$util/math.js";

import { Graphics } from "pixi.js";

export const createPlatforms = () => {
	const platforms = [
		{
			x : 10,
			y : 90,
			width : 100,
			height : 3,
		},
		{
			x : 20,
			y : 70,
			width : 15,
			height : 3,
		},
		{
			x : 40,
			y : 50,
			width : 15,
			height : 3,
		},
		{
			x : 55,
			y : 25,
			width : 15,
			height : 3,
		},
	];

	const graphics = new Graphics();

	const movesThroughPlatform = (platform, startX, startY, targetX, targetY, width) => {
		if(!inRange(targetX, platform.x - width, platform.x + platform.width)) {
			return false;
		}

		return inRange(platform.y, startY, targetY) && platform.y <= targetY;
	};

	return createEntity({
		id : "walls",
		components : {
			bounds : {
				isAtStationaryBoundary(index, x, y, width) {
					const platform = platforms[index];

					return movesThroughPlatform(platform, x, y, x, y, width) !== false;
				},

				resolve(startX, startY, targetX, targetY, width) {
					let finalX = targetX;
					let finalY = targetY;
					let needleIndex = -1;

					// its falling platforms so we can make a bunch of assumptions
					// we take the lowest value and return that
					for(let index = 0; index < platforms.length; index++) {
						const platform = platforms[index];

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

					for(const platform of platforms) {
						graphics
							.rect(platform.x, platform.y, platform.width, platform.height)
							.fill(COLOR_RED);
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
