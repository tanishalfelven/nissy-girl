<script>
import { roundHundredths, clamp } from "../../util/math.js";
import { controls } from "../../util/touch-action.svelte.js";

const MAX_TILT = 4;

let dpadElement = false;
let isPressed = $state(false);

let rotateX = $state(0);
let rotateY = $state(0);

const xDeg = $derived(`${roundHundredths(rotateX)}deg`);
const yDeg = $derived(`${roundHundredths(rotateY)}deg`);

const setRotation = (e) => {
	if(!dpadElement) {
		return false;
	}

	isPressed = true;

	const {
		left : dpadLeft,
		top : dpadTop,
		width : dpadWidth,
		height : dpadHeight,
	} = dpadElement.getBoundingClientRect();

	const normalizedX = ((e.clientX - dpadLeft) / dpadWidth) * 2 - 1;
	const normalizedY = ((e.clientY - dpadTop) / dpadHeight) * 2 - 1;

	rotateX = clamp(-normalizedY * MAX_TILT, -MAX_TILT, MAX_TILT);
	rotateY = clamp(normalizedX * MAX_TILT, -MAX_TILT, MAX_TILT);
};

const getTransform = (x, y) => {
	if(!isPressed) {
		return "";
	}

	return `translateZ(var(--button-plane)) rotateX(${x}) rotateY(${y}) scale(0.98)`;
};
</script>

<div
	class="dpad touch-interactive"
	use:controls={{
		fire : (e) => setRotation(e),
		end : () => {
			isPressed = false;
			rotateX = 0;
			rotateY = 0;
		},
	}}
	bind:this={dpadElement}
	style="transform: {getTransform(xDeg, yDeg)};"
>
	<div class="face dpad-face"></div>
	<div class="face dpad-backface"></div>

	<div class="face dpad-center-side"></div>
	<div class="face dpad-center-side left"></div>
</div>

<style>
.dpad {
	--rotate-x: 0deg;
	--rotate-y: 0deg;

	position: absolute;

	display: flex;

	flex-direction: column;

	align-items: center;
	justify-content: center;

	aspect-ratio: 31 / 30;

	height: calc(32 * var(--1px));

	left: calc(7 * var(--1px));
	bottom: calc(57.5 * var(--1px));

	padding: calc(2 * var(--1px));

	transform-style: preserve-3d;
	will-change: transform;

	transform: translateZ(var(--button-plane));
	transform-origin: center center 4px;
}

.dpad-face {
	aspect-ratio: 1 / 1;

	width: 80%;

	background-image: url("./assets/dpad.png");
}

.dpad-backface {
	aspect-ratio: 33 / 32;

	width: calc(31 * var(--1px));

	margin: auto;

	position: absolute;

	top: 0;
	left: 0;
	right: 0;
	bottom: 0;

	transform: translateZ(calc(var(--depth-w) * -0.0175));

	background-image: url("./assets/dpad-backface.png");
}

.dpad-center-side {
	aspect-ratio: 5 / 32;

	height: calc(30 * var(--1px));

	position: absolute;

	top: calc(3.2 * var(--1px));
	bottom: 0;
	left: 0;

	transform: rotateY(-90deg) translateX(-52%) translateZ(calc(-12 * var(--1px)));

	background-image: url("./assets/dpad-side.png");
}

.dpad-center-side.left {
	left: auto;
	right: 0;

	transform: rotateY(90deg) translateX(50%) translateZ(calc(-12 * var(--1px)));
}
</style>
