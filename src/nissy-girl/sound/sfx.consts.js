import volumeWheel from "$nissy-girl/assets/sound/volume-wheel.wav";
import powerToggle from "$nissy-girl/assets/sound/power-flick.wav";
import cartridgeInsertClick from "$nissy-girl/assets/sound/insert-click-2.wav";
import cartridgeRemoveClick from "$nissy-girl/assets/sound/release-and-click-4.wav";
import cartridgeScrape from "$nissy-girl/assets/sound/scrape-3.wav";
import nissyGirlBoot from "$nissy-girl/assets/sound/nissygirl-boot-4.wav";

export const nissyGirlAudio = new Map([
	[ "volumeWheel", { url : volumeWheel, gain : 1 }],
	[ "powerToggle", { url : powerToggle, gain : 0.8 }],
	[ "cartridgeInsert", { url : cartridgeInsertClick, gain : 1 }],
	[ "scrape", { url : cartridgeScrape, gain : 0.5 }],
	[ "cartridgeRemove", { url : cartridgeRemoveClick, gain : 1 }],
	[ "nissyGirlBoot", { url : nissyGirlBoot, gain : 0.35 }],
]);
