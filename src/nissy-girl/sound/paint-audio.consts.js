// pig sty https://freesound.org/people/Kulanen/sounds/556788/
import paintOink from "$nissy-girl/assets/sound/paint/oink.opus";
import paintGrunt from "$nissy-girl/assets/sound/paint/grunt.opus";
import paintWinnie from "$nissy-girl/assets/sound/paint/winnie.opus";
// https://freesound.org/people/aglinder/sounds/265582/
import paintSplash from "$nissy-girl/assets/sound/paint/splash.opus";
import paintScribble from "$nissy-girl/assets/sound/paint/jfxr-scribble.opus";
import paintLine from "$nissy-girl/assets/sound/paint/line.opus";
// pop https://freesound.org/people/musselmox/sounds/846281/
import paintPop from "$nissy-girl/assets/sound/paint/pop.opus";

export const audioSet = new Map([
	[ "oink", { url : paintOink, gain : 2 }],
	[ "navoink", { url : paintOink, gain : 1.9 }],
	[ "grunt", { url : paintGrunt, gain : 2.2 }],
	[ "winnie", { url : paintWinnie, gain : 2.9 }],
	[ "splash", { url : paintSplash, gain : 0.8 }],
	[ "scribble", { url : paintScribble, gain : 0.08 }],
	[ "line", { url : paintLine, gain : 0.1 }],
	[ "pop", { url : paintPop, gain : 0.3 }],
]);
