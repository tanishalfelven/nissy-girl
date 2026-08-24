import { randRange, roundDigit, lerp, randBool } from "$util/math.js";

import { CANVAS_WIDTH } from "$nissy-girl/screens/screen.consts.js";

import { COIN_HEIGHT, COIN_WIDTH } from "../coins.entity/coins.entity.js";

import {
	MIN_ZONE_HEIGHT,
	MIN_ZONE_PLATFORMS_LOWER,
	MIN_ZONE_PLATFORMS_UPPER,
	START_ZONE,
	ZONE_1,
	MIN_PLATFORM_WIDTH,
	MAX_PLATFORM_WIDTH,
	MIN_PLATFORM_X_GAP,
	MIN_PLATFORM_Y_GAP,
} from "./generation.consts.js";

import { matchesX } from "../platforms.entity/logic.js";

const odds = (odds) => Math.random() <= odds;
const getRand = (min, max) => roundDigit(randRange(min, max), 4);

// #region Difficulty Tuning
const getHopOdds = (difficulty) => lerp(difficulty, 0.8, 0.5);
const getMinXDistance = (difficulty, maxDistance) => lerp(difficulty, MIN_PLATFORM_X_GAP, maxDistance);
const isHop = (difficulty) => odds(getHopOdds(difficulty));
const selectHardJump = (difficulty) => odds(difficulty);
// platform min steadily decreases
const getMaxPlatformSize = (difficulty) =>
	lerp(
		difficulty,
		MAX_PLATFORM_WIDTH,
		MIN_PLATFORM_WIDTH + (MAX_PLATFORM_WIDTH - MIN_PLATFORM_WIDTH) * (1 - difficulty),
	);
const isLateralJump = (difficulty) => odds(lerp(difficulty, 0.5, 0.8));
const getJumpHeight = ({ difficulty, min, max }) => {
	if(isLateralJump(difficulty)) {
		return getRand(MIN_PLATFORM_Y_GAP, min.vert);
	}

	return getRand(min.vert, max.vert);
};
const getMinPlatforms = (difficulty) =>
	Math.floor(lerp(
		difficulty,
		MIN_ZONE_PLATFORMS_LOWER,
		MIN_ZONE_PLATFORMS_UPPER,
	));

const forceInBounds = (placeable, leftBound = CANVAS_WIDTH, rightBound = 0) => {
	if((placeable.x + placeable.width) < rightBound) {
		placeable.x = leftBound - (Math.abs(placeable.x) % leftBound);
	}

	if(placeable.x > leftBound) {
		placeable.x = placeable.x % leftBound;
	}

	return placeable;
};

const platform = (x, y, width = MIN_PLATFORM_WIDTH, zone = ZONE_1, isDifficult = false) => {
	if(x === undefined || y === undefined) {
		throw new Error(`Failed to define platform ${x} ${y}`);
	}

	return forceInBounds({
		// account for negative width
		x : x + (width < 0 ? width : 0),
		y,
		width : Math.abs(width),
		height : 2,
		zone,
		isDifficult,
	});
};

const coinFromPlatform = (platform) => {
	const x = Math.round(getRand(platform.x, platform.x + platform.width - COIN_WIDTH));
	const y = platform.y - COIN_HEIGHT - 5;

	return { x, y, width : COIN_WIDTH };
};

const START_PLATFORM = platform(10, 90, 100, START_ZONE);

export const DEV_MAP = [
	START_PLATFORM,
	platform(20, 70),
	platform(40, 50),
	platform(55, 25),
];

const getMaxXForHeight = ({
	jumpHeight,
	min,
	max,
}) => {
	if(jumpHeight <= min.vert) {
		// for short jumps prioritize furthest available x
		return lerp(
			jumpHeight / min.vert,
			min.maxHorz,
			min.horz,
		);
	}

	// for tall jumps priorize max height
	return lerp(
		(jumpHeight - min.vert) / (max.vert - min.vert),
		min.horz,
		max.horz,
	);
};

const isEasyJump = ({
	capabilities : j,
	platforms,
	candidate,
}) => {
	// walk backwards since we know recent entries are higher
	for(let i = platforms.length - 1; i >= 0; i--) {
		const platform = platforms[i];

		const jumpHeight = platform.y - candidate.y;

		if(jumpHeight > j.blastMax.vert) {
			continue;
		}

		const isShort = jumpHeight <= j.hopMax.vert;
		const jumpMin = isShort ? j.hopMin : j.blastMin;
		const jumpMax = isShort ? j.hopMax : j.blastMax;

		const xSweep = getMaxXForHeight({
			jumpHeight,
			min : jumpMin,
			max : jumpMax,
		});

		if(
			matchesX(
				platform.x,
				platform.width,
				candidate.x - xSweep,
				candidate.width + xSweep,
			)
		) {
			return true;
		}
	}

	return false;
};

const generateX = ({
	fromPlatform,
	maxX,
	difficulty,
}) => {
	const center = fromPlatform.x + (fromPlatform.width / 2);
	const maxDistance = (fromPlatform.width / 2) + maxX;
	const minDistance = getMinXDistance(difficulty, maxDistance);

	const distance = getRand(minDistance, maxDistance);
	const direction = randBool() ? 1 : -1;

	return { x : center + distance * direction, direction };
};

const generatePlatform = ({
	capabilities : j,
	fromPlatform,
	zone = ZONE_1,
	isHop = false,
	difficulty,
}) => {
	const min = isHop ? j.hopMin : j.blastMin;
	const max = isHop ? j.hopMax : j.blastMax;

	const jumpHeight = getJumpHeight({ difficulty, min, max });

	const maxX = getMaxXForHeight({ jumpHeight, min, max });

	const y = fromPlatform.y - jumpHeight;
	const { x, direction } = generateX({ fromPlatform, maxX, difficulty });

	const platformSize = getRand(MIN_PLATFORM_WIDTH, getMaxPlatformSize(difficulty));

	return platform(
		x,
		y,
		platformSize * direction,
		zone,
	);
};

const generateCoins = ({
	platforms,
	coinCount = 20,
}) => {
	let coinsPlaced = 0;

	const coins = [];

	const coinsPerZone = {};

	let COIN_PER_ZONE = 0;

	for(let i = platforms.length - 1; i > 0; i--) {
		if(coinsPlaced >= coinCount) {
			break;
		}

		const platform = platforms[i];

		// set max coin per zone once when we know the max number of zones
		// reverse sort so first platform is max zone
		if(COIN_PER_ZONE === 0) {
			COIN_PER_ZONE = coinCount / (platform.zone - 1);
		}

		if(!coinsPerZone[platform.zone]) {
			coinsPerZone[platform.zone] = 0;
		}

		if(!platform.isDifficult || coinsPerZone[platform.zone] >= COIN_PER_ZONE) {
			continue;
		}

		const hardPlatformCoinOdds = odds(0.35);

		if(hardPlatformCoinOdds) {
			coinsPerZone[platform.zone]++;
			coinsPlaced++;

			coins.push(
				forceInBounds(
					coinFromPlatform(platform),
					CANVAS_WIDTH - COIN_WIDTH,
					COIN_WIDTH,
				),
			);
		}
	}

	console.log(coinsPlaced, coinsPerZone);

	return coins;
};

const MAX_REROLLS = 5;

const generateZone = ({
	capabilities,
	fromPlatform,
	zone = ZONE_1,
	difficulty = 0,
	history = [],
}) => {
	const platforms = [];

	const minY = fromPlatform.y - MIN_ZONE_HEIGHT;
	let mostRecentPlatform = fromPlatform;
	let highestPlatformY = fromPlatform.y;
	let isHardJump = selectHardJump(difficulty);
	let rerolls = 0;
	const minPlatforms = getMinPlatforms(difficulty);

	do{
		const candidate = generatePlatform({
			capabilities,
			fromPlatform : mostRecentPlatform,
			zone,
			isHop : isHop(difficulty),
			difficulty,
		});

		rerolls++;

		if(
			rerolls < MAX_REROLLS
			&& isHardJump
			&& isEasyJump({
				capabilities,
				candidate,
				// use all platforms but the from we generated against to determine if this is "hard"
				platforms : platforms.length > 1
					// accounting for history in entry to zone seems like enough but watching this closely
					? platforms.slice(0, -1)
					: history,
			})) {
			continue;
		}

		if(rerolls >= MAX_REROLLS) {
			console.log(`failed to make difficult: ${zone} ${platforms.length}`);
		}

		candidate.isDifficult = isHardJump;

		platforms.push(candidate);

		rerolls = 0;
		isHardJump = selectHardJump(difficulty);

		mostRecentPlatform = candidate;
		highestPlatformY = candidate.y;
	} while(highestPlatformY > minY || platforms.length < minPlatforms);

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
				history : platforms,
			}),
		);
	}

	const coins = generateCoins({ platforms });

	return { platforms, coins };
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
