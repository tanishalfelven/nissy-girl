import volumeWheel from "$nissy-girl/assets/sound/volume-wheel.opus";
import powerToggle from "$nissy-girl/assets/sound/power-flick.opus";
import cartridgeInsertClick from "$nissy-girl/assets/sound/insert-click-2.opus";
import cartridgeRemoveClick from "$nissy-girl/assets/sound/release-and-click-4.opus";
import cartridgeScrape from "$nissy-girl/assets/sound/scrape-3.opus";
import nissyGirlBoot from "$nissy-girl/assets/sound/nissygirl-boot-4.opus";

// MATUSTRM | PACK Sounds RPG | CC0
import jumperBack from "$nissy-girl/assets/sound/jumper/jumper-back.opus";
import jumperButton from "$nissy-girl/assets/sound/jumper/jumper-button.opus";
import jumperConfirm from "$nissy-girl/assets/sound/jumper/jumper-confirm.opus";
import jumperPause from "$nissy-girl/assets/sound/jumper/jumper-pause.opus";
// MATUSTRM | Casual Game Sounds | CC0
import jumperTick from "$nissy-girl/assets/sound/jumper/jumper-tick.opus";
// https://freesound.org/people/magnuswaker/sounds/641042/
import jumperCountdownBeep from "$nissy-girl/assets/sound/jumper/jumper-countdown-beep.opus";
import jumperCountdownFinish from "$nissy-girl/assets/sound/jumper/jumper-countdown-finish.opus";
import jumperImpactReaction from "$nissy-girl/assets/sound/jumper/jumper-impact-reaction.opus";
import jumperJump from "$nissy-girl/assets/sound/jumper/jumper-jump.opus";
import jumperBlast from "$nissy-girl/assets/sound/jumper/jumper-blast2.opus";
// https://freesound.org/people/clairinski/sounds/184372/?client_id=1430886896.1772668802&session_id=1772668802
import jumperCoin from "$nissy-girl/assets/sound/jumper/jumper-coin.opus";
// https://freesound.org/people/jhyland/sounds/539679/
import jumperWin from "$nissy-girl/assets/sound/jumper/jumper-win.opus";
// https://opengameart.org/content/jump-landing-sound
import jumpLanding from "$nissy-girl/assets/sound/jumper/jumpland.opus";

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
	[ "beep", { url : jumperCountdownBeep, gain : 0.09 }],
	[ "beep-finish", { url : jumperCountdownFinish, gain : 0.09 }],
	[ "impact-reaction", { url : jumperImpactReaction, gain : 0.8 }],
	[ "jump", { url : jumperJump, gain : 0.5 }],
	[ "land", { url : jumpLanding, gain : 0.14 }],
	[ "blast", { url : jumperBlast, gain : 0.3 }],
	[ "coin", { url : jumperCoin, gain : 0.65 }],
	[ "win", { url : jumperWin, gain : 0.35 }],
]);
