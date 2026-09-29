// pig sty https://freesound.org/people/Kulanen/sounds/556788/
import paintOink from "./assets/paint/oink.opus";
import paintGrunt from "./assets/paint/grunt.opus";
import paintWinnie from "./assets/paint/winnie.opus";
// https://freesound.org/people/aglinder/sounds/265582/
import paintSplash from "./assets/paint/splash.opus";
import paintScribble from "./assets/paint/jfxr-scribble.opus";
import paintLine from "./assets/paint/line.opus";
// pop https://freesound.org/people/musselmox/sounds/846281/
import paintPop from "./assets/paint/pop.opus";

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
