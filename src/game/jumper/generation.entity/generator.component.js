import { randRange, randBool, lerp } from "$util/math.js";

import { CANVAS_WIDTH } from "$nissy-girl/screens/screen.consts.js";

import {
	ZONE_HEIGHT,
	START_ZONE,
	ZONE_1,
	MIN_PLATFORM_WIDTH,
} from "./generation.consts.js";

const forceInBounds = (platform, forceWidth = CANVAS_WIDTH) => {
	if((platform.x + platform.width) < 0) {
		platform.x = forceWidth - (Math.abs(platform.x) % forceWidth);
	}

	if(platform.x > forceWidth) {
		platform.x = platform.x % forceWidth;
	}

	return platform;
};

const platform = (x, y, width = MIN_PLATFORM_WIDTH, zone = ZONE_1) => {
	if(x === undefined || y === undefined) {
		throw new Error(`Failed to define platform ${x} ${y}`);
	}

	return forceInBounds({
		x,
		y,
		width,
		height : 2,
		zone,
	});
};

const START_PLATFORM = platform(10, 90, 100, START_ZONE);

export const DEV_MAP = [
	START_PLATFORM,
	platform(20, 70),
	platform(40, 50),
	platform(55, 25),
];

const generateShortPlatform = (j, fromPlatform, zone = ZONE_1, isHop = false) => {
	const min = isHop ? j.hopMin : j.blastMin;
	const max = isHop ? j.hopMax : j.blastMax;

	console.log({ isHop, min, max, j });

	const jumpHeight = randRange(min.vert, max.vert);
	const maxX = lerp(
		jumpHeight / (max.vert - min.vert),
		min.horz,
		max.horz,
	);

	const y = fromPlatform.y - jumpHeight;
	const x = randRange(fromPlatform.x - maxX, fromPlatform.x + fromPlatform.width + maxX);

	return platform(x, y, MIN_PLATFORM_WIDTH, zone);
};

const generateZone = (capabilities, entryPlatform, zone = ZONE_1) => {
	const platforms = [];

	const targetY = entryPlatform.y - ZONE_HEIGHT;
	let mostRecentPlatform = entryPlatform;
	let highestPlatformY = entryPlatform.y;

	do{
		const nextPlaform = generateShortPlatform(
			capabilities,
			mostRecentPlatform,
			zone,
			randBool(),
		);

		platforms.push(nextPlaform);

		mostRecentPlatform = nextPlaform;
		highestPlatformY = nextPlaform.y;
	} while(highestPlatformY > targetY);

	return platforms;
};

const generate = (capabilities, startPlatform = START_PLATFORM) => {
	const platforms = [ startPlatform ];

	for(let zone = ZONE_1; zone <= 8; zone++) {
		platforms.push(
			...generateZone(
				capabilities,
				platforms[platforms.length - 1],
				zone,
			),
		);
	}

	return platforms;
};

export const createGenerator = ({
	world,
	capabilities,
}) => {
	return {
		async load() {
			const capabilityData = capabilities.get();

			const maps = {
				dev : DEV_MAP,

				gen_test : generate(capabilityData),
			};

			// just in case something neat happens and I need to save it.
			window.dumpMaps = () => console.log(maps);

			world.world.notifyGame({ type : "CACHE_GENERATION", data : { maps } });
			world.world.notifyGame({ type : "DONE" });
		},
	};
};
