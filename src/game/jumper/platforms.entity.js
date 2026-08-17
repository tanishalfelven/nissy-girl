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

	return createEntity({
		id : "walls",
		components : {
			bounds : {
				resolve(startX, targetX, startY, targetY, width, height) {
					let finalX = targetX;
					let finalY = targetY;

					// its falling platforms so we can make a bunch of assumptions
					// we take the lowest value and return that
					for(const platform of platforms) {
						if(!inRange(targetX, platform.x - width, platform.x + platform.width)) {
							continue;
						}

						const bottomEdgeY = platform.y - height;

						if(inRange(bottomEdgeY, startY, targetY) && bottomEdgeY < finalY) {
							finalY = bottomEdgeY;
						}
					}

					return { x : finalX, y : finalY };
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
