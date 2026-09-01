import volumeWheel from "$nissy-girl/assets/sound/volume-wheel.opus";
import powerToggle from "$nissy-girl/assets/sound/power-flick.opus";
import cartridgeInsertClick from "$nissy-girl/assets/sound/insert-click-2.opus";
import cartridgeRemoveClick from "$nissy-girl/assets/sound/release-and-click-4.opus";
import cartridgeScrape from "$nissy-girl/assets/sound/scrape-3.opus";
import nissyGirlBoot from "$nissy-girl/assets/sound/nissygirl-boot-4.opus";

// MATUSTRM | PACK Sounds RPG | CC0
import jumperBack from "$nissy-girl/assets/sound/jumper-back.opus";
import jumperButton from "$nissy-girl/assets/sound/jumper-button.opus";
import jumperConfirm from "$nissy-girl/assets/sound/jumper-confirm.opus";
import jumperPause from "$nissy-girl/assets/sound/jumper-pause.opus";
// MATUSTRM | Casual Game Sounds | CC0
import jumperTick from "$nissy-girl/assets/sound/jumper-tick.opus";
// https://freesound.org/people/magnuswaker/sounds/641042/
import jumperCountdownBeep from "$nissy-girl/assets/sound/jumper-countdown-beep.opus";
import jumperCountdownFinish from "$nissy-girl/assets/sound/jumper-countdown-finish.opus";

export const nissyGirlAudio = new Map([
	[ "volumeWheel", { url : volumeWheel, gain : 1 }],
	[ "powerToggle", { url : powerToggle, gain : 0.8 }],
	[ "cartridgeInsert", { url : cartridgeInsertClick, gain : 1 }],
	[ "scrape", { url : cartridgeScrape, gain : 0.5 }],
	[ "cartridgeRemove", { url : cartridgeRemoveClick, gain : 1 }],
	[ "nissyGirlBoot", { url : nissyGirlBoot, gain : 0.35 }],
]);

export const jumperAudio = new Map([
	[ "back", { url : jumperBack, gain : 1 }],
	[ "button", { url : jumperButton, gain : 1 }],
	[ "confirm", { url : jumperConfirm, gain : 1 }],
	[ "pause", { url : jumperPause, gain : 1 }],
	[ "tick", { url : jumperTick, gain : 1 }],
	[ "beep", { url : jumperCountdownBeep, gain : 0.45 }],
	[ "beep-finish", { url : jumperCountdownFinish, gain : 0.45 }],
]);
