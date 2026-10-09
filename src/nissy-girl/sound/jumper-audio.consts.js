// MATUSTRM | PACK Sounds RPG | CC0
import jumperBack from "./assets/jumper/jumper-back.opus";
import jumperButton from "./assets/jumper/jumper-button.opus";
import jumperConfirm from "./assets/jumper/jumper-confirm.opus";
import jumperPause from "./assets/jumper/jumper-pause.opus";

// MATUSTRM | Casual Game Sounds | CC0
import jumperTick from "./assets/jumper/jumper-tick.opus";

// https://freesound.org/people/magnuswaker/sounds/641042/
import jumperCountdownBeep from "./assets/jumper/jumper-countdown-beep.opus";
import jumperCountdownFinish from "./assets/jumper/jumper-countdown-finish.opus";
import jumperImpactReaction from "./assets/jumper/jumper-impact-reaction.opus";
import jumperJump from "./assets/jumper/jumper-jump.opus";
import jumperBlast from "./assets/jumper/jumper-blast2.opus";

// https://freesound.org/people/clairinski/sounds/184372/?client_id=1430886896.1772668802&session_id=1772668802
import jumperCoin from "./assets/jumper/jumper-coin.opus";

// https://freesound.org/people/jhyland/sounds/539679/
import jumperWin from "./assets/jumper/jumper-win.opus";

// https://opengameart.org/content/jump-landing-sound
import jumpLanding from "./assets/jumper/jumpland.opus";

export const audioSet = new Map([
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
