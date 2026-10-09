import { expect } from "@playwright/test";

// Sound effects by source file name (src/nissy-girl/sound/assets).
export const SFX = {
	powerToggle : "power-flick",
	cartridgeInsert : "insert-click",
	cartridgeScrape : "scrape",
	cartridgeRemove : "release-and-click",
	bootJingle : "nissygirl-boot",
};

export const playCount = (audio, sound) => {
	let count = 0;

	for(const [{ url }] of audio.start.calls) {
		if(url.includes(sound)) {
			count++;
		}
	}

	return count;
};

// Performs the action and expects it to play each sound exactly once.
export const expectPlaysOnce = async (audio, sounds, action) => {
	const before = new Map();

	for(const sound of sounds) {
		before.set(sound, playCount(audio, sound));
	}

	await action();

	for(const sound of sounds) {
		await expect.poll(() => {
			return playCount(audio, sound);
		}).toBe(before.get(sound) + 1);
	}
};
