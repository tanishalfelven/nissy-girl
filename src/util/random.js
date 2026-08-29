import { lerp } from "./math.js";

// mulberry32 from https://github.com/cprosche/mulberry32
export const getSeededRandom = (a) => {
	return () => {
		var t = a += 0x6D2B79F5;
		t = Math.imul(t ^ t >>> 15, t | 1);
		t ^= t + Math.imul(t ^ t >>> 7, t | 61);
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
};

// fnv from https://thimbleby.gitlab.io/algorithm-wiki-site/wiki/fowler-noll-vo_hash_function/
export const hash = (str) => {
	let hash = 2166136261;
	const prime = 16777619;

	for(let i = 0; i < str.length; i++) {
		hash ^= str.charCodeAt(i);

		hash = Math.imul(hash, prime);
	}

	return hash >>> 0;
};

export const randRange = (min, max, getRandom = Math.random) => lerp(getRandom(), min, max);
export const randBool = (getRandom = Math.random) => Math.round(getRandom()) === 0;
export const odds = (odds, getRandom = Math.random) => getRandom() <= odds;
