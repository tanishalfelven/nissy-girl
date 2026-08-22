import { createEntity } from "$game/shared/entity/entity.js";

import { COLOR_RED } from "$nissy-girl/screens/render.consts.js";

import { inRange } from "$util/math.js";

import { Graphics } from "pixi.js";

export const createPlatforms = ({
	world,
}) => {
	const { generation } = world.world.getContext();

	const map = generation.maps.gen_test;

	const graphics = new Graphics();

	const movesThroughPlatform = (platform, startX, startY, targetX, targetY, width) => {
		if(!inRange(targetX, platform.x - width, platform.x + platform.width)) {
			return false;
		}

		return inRange(platform.y, startY, targetY) && platform.y <= targetY;
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
