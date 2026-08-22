import { Graphics } from "pixi.js";

import { wrap } from "$util/math.js";

import {
	START_ZONE,
} from "$game/jumper/generation.entity/generation.consts.js";

import {
	wrapsRight,
	isOutOfBounds,
} from "./logic.js";

import {
	COLOR_RED,
	COLOR_ICY_BLUE,
	COLOR_MUTE_LIME,
	COLOR_ORANGE,
	COLOR_HEX_PURPLE,
	COLOR_PINK,
} from "$nissy-girl/screens/render.consts.js";

const START_ZONE_COLOR = COLOR_ICY_BLUE;

const ZONE_COLOR = [
	COLOR_PINK,
	COLOR_RED,
	COLOR_MUTE_LIME,
	COLOR_ORANGE,
	COLOR_HEX_PURPLE,
];

const getZoneColor = (zone) => {
	if(zone === START_ZONE) {
		return START_ZONE_COLOR;
	}

	return ZONE_COLOR[wrap(zone, 0, ZONE_COLOR.length)];
};

export const createRender = ({
	map,
	bounds,
}) => {
	const graphics = new Graphics();

	return {
		update() {
			graphics.clear();

			for(const platform of map) {
				graphics
					.rect(platform.x, platform.y, platform.width, platform.height)
					.fill(getZoneColor(platform.zone));

				if(isOutOfBounds(platform, bounds)) {
					const wrapOffset = wrapsRight(platform.x) ? bounds.width : -bounds.width;

					graphics
						.rect(platform.x + wrapOffset, platform.y, platform.width, platform.height)
						.fill(getZoneColor(platform.zone));
				}
			}
		},

		getRenderable() {
			return graphics;
		},

		destroy() {
			graphics.destroy();
		},
	};
};
