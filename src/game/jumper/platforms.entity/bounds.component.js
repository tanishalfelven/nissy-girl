import { findIntersectionInZone, movesThroughPlatform } from "./logic.js";
import {
	START_ZONE,
	ZONE_1,
	ZONE_HEIGHT,
} from "$game/jumper/generation.entity/generation.consts.js";

export const createBounds = ({ map, bounds }) => {
	const platformsByZone = map.reduce((accPlatformByZone, platform, index) => {
		if(!accPlatformByZone.has(platform.zone)) {
			accPlatformByZone.set(platform.zone, []);
		}

		accPlatformByZone.get(platform.zone).push({
			platform,
			platformIndex : index,
		});

		return accPlatformByZone;
	}, new Map());

	const zone1StartY = platformsByZone.get(ZONE_1)[0].platform.y;

	const getZoneIndex = (y) => {
		if(zone1StartY < y) {
			return START_ZONE;
		}

		return Math.floor(Math.abs(y - zone1StartY) / ZONE_HEIGHT) + ZONE_1;
	};

	return {
		getSpawn() {
			const startPlatform = map[0];

			return { x : startPlatform.x + 5, y : startPlatform.y };
		},

		remainsGrounded(index, x, y, width) {
			const platform = map[index];

			return movesThroughPlatform(platform, x, y, x, y, width, bounds) !== false;
		},

		moveIntersectsPlatform(startX, startY, targetX, targetY, width) {
			const startZoneIndex = getZoneIndex(startY);
			const targetZoneIndex = getZoneIndex(targetY);

			// assume the target zone is always more relevant
			let foundIntersection = findIntersectionInZone(
				startX,
				startY,
				targetX,
				targetY,
				width,
				platformsByZone.get(targetZoneIndex),
				bounds,
			);

			if(foundIntersection.index === -1) {
				const secondIntersection = findIntersectionInZone(
					startX,
					startY,
					targetX,
					targetY,
					width,
					platformsByZone.get(startZoneIndex),
					bounds,
				);

				if(secondIntersection.index !== -1) {
					foundIntersection = secondIntersection;
				}
			}

			return foundIntersection;
		},
	};
};
