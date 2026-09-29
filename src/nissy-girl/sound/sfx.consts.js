import volumeWheel from "./assets/volume-wheel.opus";
import powerToggle from "./assets/power-flick.opus";
import cartridgeInsertClick from "./assets/insert-click-2.opus";
import cartridgeRemoveClick from "./assets/release-and-click-4.opus";
import cartridgeScrape from "./assets/scrape-3.opus";
import nissyGirlBoot from "./assets/nissygirl-boot-4.opus";
import button from "./assets/bean-button.opus";
import dpad from "./assets/dpad2.opus";

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
