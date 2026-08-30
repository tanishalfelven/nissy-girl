import { Graphics, Container } from "pixi.js";

import { inRange, wrap } from "$util/math.js";

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
	COLOR_LIGHT_SEA_GREEN,
	COLOR_ORANGE,
	COLOR_HEX_PURPLE,
	COLOR_PINK,
	COLOR_DIRT_BLUE,
	COLOR_SILVER,
	COLOR_GOLD,
} from "$nissy-girl/screens/render.consts.js";
import { CANVAS_WIDTH } from "$nissy-girl/screens/screen.consts.js";

const START_ZONE_COLOR = COLOR_ICY_BLUE;

const ZONE_COLOR = [
	COLOR_RED,
	COLOR_ORANGE,
	COLOR_GOLD,
	COLOR_LIGHT_SEA_GREEN,
	COLOR_DIRT_BLUE,
	COLOR_HEX_PURPLE,
	COLOR_PINK,
	COLOR_SILVER,
];

const getZoneColor = (zone) => {
	if(zone === START_ZONE) {
		return START_ZONE_COLOR;
	}

	return ZONE_COLOR[wrap(zone - 1, 0, ZONE_COLOR.length)];
};

const ZONE_PREV = 1;
const ZONE_NEXT = 1;

export const createRender = ({
	world,
	platforms,
	bounds,
	worldBounds,
}) => {
	const platformZones = new Container();
	const platformZonesMap = new Map();

	for(const platform of platforms) {
		let zone = platformZonesMap.get(platform.zone);

		if(!zone) {
			zone = new Graphics({ renderable : false });

			platformZonesMap.set(platform.zone, zone);
			platformZones.addChild(zone);
		}

		if(platform.width === CANVAS_WIDTH) {
			zone
				.rect(platform.x, platform.y, platform.width, platform.height)
				.fill(getZoneColor(platform.zone));
		} else {
			for(let i = 0; i < platform.height; i++) {
				zone
					.rect(platform.x + i, platform.y + i, platform.width - i * 2, 1)
					.fill(getZoneColor(platform.zone));

				if(isOutOfBounds(platform.x, platform.width, worldBounds)) {
					const wrapOffset = wrapsRight(platform.x) ? worldBounds.width : -worldBounds.width;

					zone
						.rect(platform.x + wrapOffset + i, platform.y + i, platform.width - i * 2, 1)
						.fill(getZoneColor(platform.zone));
				}
			}
		}
	}

	let jumper;
	let lastZoneMeasured = -1;

	return {
		update() {
			if(!jumper) {
				jumper = world.world.get("jumper");
			}

			const currentZone = bounds.getZoneIndex(jumper.movement.getY());

			if(currentZone !== -1 && currentZone !== lastZoneMeasured) {
				for(const [ zoneIndex, zoneGraphics ] of platformZonesMap) {
					zoneGraphics.renderable = inRange(zoneIndex, currentZone - ZONE_PREV, currentZone + ZONE_NEXT);
				}

				lastZoneMeasured = currentZone;
			}
		},

		getRenderable() {
			return platformZones;
		},

		destroy() {
			platformZones.destroy({ children : true });
		},
	};
};
