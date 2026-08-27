import { START_ZONE } from "../generation.entity/generation.consts.js";
import { findIntersectionInZone, movesThroughPlatform } from "./logic.js";

export const createBounds = ({ platforms, bounds }) => {
	const startPlatform = platforms[0];

	const platformsByZone = platforms.reduce((accPlatformByZone, platform, index) => {
		if(!accPlatformByZone.has(platform.zone)) {
			accPlatformByZone.set(platform.zone, []);
		}

		accPlatformByZone.get(platform.zone).push({
			platform,
			platformIndex : index,
		});

		return accPlatformByZone;
	}, new Map());

	const zoneBounds = [];

	for(const [ zone, platforms ] of platformsByZone) {
		zoneBounds.push({
			zone,
			startY : platforms[0].platform.y,
			endY : platforms[platforms.length - 1].platform.y,
		});
	}

	const getZoneIndex = (y) => {
		if(y >= startPlatform.y) {
			return START_ZONE;
		}

		for(const zone of zoneBounds) {
			if(y > zone.startY) {
				continue;
			}

			if(y >= zone.endY) {
				return zone.zone;
			}
		}

		return -1;
	};

	return {
		getSpawn() {
			const startPlatform = platforms[0];

			return { x : startPlatform.x + startPlatform.width / 2, y : startPlatform.y };
		},

		remainsGrounded(index, x, y, width) {
			const platform = platforms[index];

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

			if(foundIntersection.index === -1
				&& startZoneIndex !== -1
				&& startZoneIndex !== targetZoneIndex) {
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
