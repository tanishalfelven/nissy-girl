import volumeWheel from "$nissy-girl/assets/sound/volume-wheel.opus";
import powerToggle from "$nissy-girl/assets/sound/power-flick.opus";
import cartridgeInsertClick from "$nissy-girl/assets/sound/insert-click-2.opus";
import cartridgeRemoveClick from "$nissy-girl/assets/sound/release-and-click-4.opus";
import cartridgeScrape from "$nissy-girl/assets/sound/scrape-3.opus";
import nissyGirlBoot from "$nissy-girl/assets/sound/nissygirl-boot-4.opus";
import button from "$nissy-girl/assets/sound/bean-button.opus";
import dpad from "$nissy-girl/assets/sound/dpad2.opus";

export const nissyGirlAudio = new Map([
	[ "volumeWheel", { url : volumeWheel, gain : 1 }],
	[ "powerToggle", { url : powerToggle, gain : 0.8 }],
	[ "cartridgeInsert", { url : cartridgeInsertClick, gain : 1 }],
	[ "scrape", { url : cartridgeScrape, gain : 0.5 }],
	[ "cartridgeRemove", { url : cartridgeRemoveClick, gain : 1 }],
	[ "nissyGirlBoot", { url : nissyGirlBoot, gain : 0.35 }],
	[ "button", { url : button, gain : 0.05 }],
	[ "dpad", { url : dpad, gain : 0.05 }],
]);
