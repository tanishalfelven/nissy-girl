import { randRange, roundDigit, lerp, randBool } from "$util/math.js";

import { CANVAS_WIDTH } from "$nissy-girl/screens/screen.consts.js";

import {
	ZONE_HEIGHT,
	START_ZONE,
	ZONE_1,
	MIN_PLATFORM_WIDTH,
	MAX_PLATFORM_WIDTH,
} from "./generation.consts.js";

const MAX_HOP_ODDS = 0.85;

const odds = (odds) => Math.random() <= odds;
const getRand = (min, max) => roundDigit(randRange(min, max), 4);

const isHop = (difficulty = 0) => odds(MAX_HOP_ODDS - difficulty * MAX_HOP_ODDS);

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

const generateX = ({
	fromPlatform,
	maxX,
	difficulty,
}) => {
	const center = fromPlatform.x + (fromPlatform.width / 2);
	const maxDistance = (fromPlatform.width / 2) + maxX;
	const minDistance = lerp(difficulty, 0, maxDistance * 0.75);

	const distance = getRand(minDistance, maxDistance);
	const direction = randBool() ? -1 : 1;

	return center + distance * direction;
};

const generateShortPlatform = ({
	capabilities : j,
	fromPlatform,
	zone = ZONE_1,
	isHop = false,
	difficulty,
}) => {
	const min = isHop ? j.hopMin : j.blastMin;
	const max = isHop ? j.hopMax : j.blastMax;

	// min distance slowly raises with difficulty
	const minJump = lerp(difficulty, min.vert, max.vert);

	const jumpHeight = getRand(minJump, max.vert);
	const maxX = lerp(
		(jumpHeight - min.vert) / (max.vert - min.vert),
		min.horz,
		max.horz,
	);

	const y = fromPlatform.y - jumpHeight;
	const x = generateX({ fromPlatform, maxX, difficulty });

	// platforms steadily get smaller as you go up
	const minPlatformSize = lerp(
		difficulty,
		MAX_PLATFORM_WIDTH,
		MIN_PLATFORM_WIDTH + (MAX_PLATFORM_WIDTH - MIN_PLATFORM_WIDTH) * (1 - difficulty),
	);
	const platformSize = getRand(MIN_PLATFORM_WIDTH, minPlatformSize);

	return platform(x, y, platformSize, zone);
};

const generateZone = ({
	capabilities,
	fromPlatform,
	zone = ZONE_1,
	difficulty = 0,
}) => {
	const platforms = [];

	const targetY = fromPlatform.y - ZONE_HEIGHT;
	let mostRecentPlatform = fromPlatform;
	let highestPlatformY = fromPlatform.y;

	do{
		const nextPlaform = generateShortPlatform({
			capabilities,
			fromPlatform : mostRecentPlatform,
			zone,
			isHop : isHop(),
			difficulty,
		});

		platforms.push(nextPlaform);

		mostRecentPlatform = nextPlaform;
		highestPlatformY = nextPlaform.y;
	} while(highestPlatformY > targetY);

	return platforms;
};

const generate = (capabilities, startPlatform = START_PLATFORM) => {
	const platforms = [ startPlatform ];

	const NUM_ZONES = 8;

	for(let zone = ZONE_1; zone <= NUM_ZONES; zone++) {
		platforms.push(
			...generateZone({
				capabilities,
				fromPlatform : platforms[platforms.length - 1],
				zone,
				difficulty : zone / NUM_ZONES,
			}),
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
