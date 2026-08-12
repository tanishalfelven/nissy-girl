import volumeWheel from "$nissy-girl/assets/sound/volume-wheel.wav";
import powerOn from "$nissy-girl/assets/sound/power-on.wav";
import powerOff from "$nissy-girl/assets/sound/power-off.wav";
import cartridgeInsertClick from "$nissy-girl/assets/sound/insert-click-2.wav";
import cartridgeRemoveClick from "$nissy-girl/assets/sound/release-and-click-4.wav";
import cartridgeScrape from "$nissy-girl/assets/sound/scrape-3.wav";

export const nissyGirlAudio = new Map([
	[ "volumeWheel", { url : volumeWheel }],
	[ "powerOn", { url : powerOn }],
	[ "powerOff", { url : powerOff }],
	[ "cartridgeInsert", { url : cartridgeInsertClick }],
	[ "scrape", { url : cartridgeScrape }],
	[ "cartridgeRemove", { url : cartridgeRemoveClick }],
]);
