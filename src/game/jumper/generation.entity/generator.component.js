import { lerp } from "$util/math.js";

import { CANVAS_WIDTH } from "$nissy-girl/screens/screen.consts.js";

const randRange = (min, max) => lerp(Math.random(), min, max);

const RUN_HEIGHT = 600;

const forceInBounds = (platform, forceWidth = CANVAS_WIDTH) => {
	if((platform.x + platform.width) < 0) {
		platform.x = forceWidth - (Math.abs(platform.x) % forceWidth);
	}

	if(platform.x > forceWidth) {
		platform.x = platform.x % forceWidth;
	}

	return platform;
};

const platform = (x, y, width = 15) => {
	if(x === undefined || y === undefined) {
		throw new Error(`Failed to define platform ${x} ${y}`);
	}

	return forceInBounds({
		x,
		y,
		width,
		height : 2,
	});
};

const START_PLATFORM = platform(10, 90, 100);

export const DEV_MAP = [
	START_PLATFORM,
	platform(20, 70),
	platform(40, 50),
	platform(55, 25),
];

const generateShortPlatform = (j, fromPlatform) => {
	const jumpHeight = randRange(j.hopMin.vert, j.hopMax.vert);
	const maxX = lerp(jumpHeight, j.hopMin.horz, j.hopMax.horz);

	const y = fromPlatform.y - jumpHeight;
	const x = randRange(fromPlatform.x - maxX, fromPlatform.x + fromPlatform.width + maxX);

	return platform(x, y);
};

const generateRun = (capabilities, entryPlatform, height = RUN_HEIGHT) => {
	const platforms = [];

	const targetY = entryPlatform.y - height;
	let mostRecentPlatform = entryPlatform;
	let highestPlatformY = entryPlatform.y;

	do{
		const nextPlaform = generateShortPlatform(capabilities, mostRecentPlatform);

		platforms.push(nextPlaform);

		mostRecentPlatform = nextPlaform;
		highestPlatformY = nextPlaform.y;
	} while(highestPlatformY > targetY);

	return platforms;
};

const generate = (capabilities, startPlatform = START_PLATFORM) => {
	const platforms = [ startPlatform ];

	platforms.push(...generateRun(capabilities, startPlatform));

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
