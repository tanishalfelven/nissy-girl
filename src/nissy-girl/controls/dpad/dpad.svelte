<script module>
const normalize = (pos, max) =>
	// pos can be out of bounds of Max, so clamp
	// this produces a (-1 to 1) value
	(Math.min(pos, max) / max) * 2 - 1;

const DIRECTIONS = [
	{ type : DPAD_LEFT, isHorzAxis : true, sign : -1 },
	{ type : DPAD_RIGHT, isHorzAxis : true, sign : 1 },
	{ type : DPAD_UP, isHorzAxis : false, sign : 1 },
	{ type : DPAD_DOWN, isHorzAxis : false, sign : -1 },
];

const getTransform = (x, y) => {
	if(x === 0 && y === 0) {
		return "";
	}

	return `translateZ(var(--button-plane)) rotateX(${x}) rotateY(${y}) scale(0.98)`;
};
</script>
<script>
import { roundHundredths } from "$util/math.js";
import { controls } from "$util/touch-action.svelte.js";

import css from "./dpad.mcss";
import { rotation } from "$nissy-girl/camera.viewmodel.svelte.js";
import { input } from "$nissy-girl/input.js";
import {
	TRIGGERED,
	RELEASED,
	DPAD_DOWN,
	DPAD_LEFT,
	DPAD_RIGHT,
	DPAD_UP,
} from "$game/shared/input.consts.js";

const MAX_TILT = 3;
const TILT_DEADZONE = 0.2;
const DIAGONAL_MIN = 0.48;
const DIAGONAL_MAGNITUDE_MIN = Math.hypot(0.7, 0.7);

let pointerX = $state(0);
let pointerY = $state(0);

let dpadElement = false;

let dpadX = $state(0);
let dpadY = $state(0);

let dpadLeft = 0;
let dpadTop = 0;
let dpadWidth = 0;
let dpadHeight = 0;

let rotationValue = 0;

const storeDpadState = (e) => {
	if(!dpadElement) {
		return false;
	}

	if(rotationValue !== rotation.progress || (dpadLeft === 0 && dpadTop === 0 && dpadWidth === 0 && dpadHeight === 0)) {
		({
			left : dpadLeft,
			top : dpadTop,
			width : dpadWidth,
			height : dpadHeight,
		} = dpadElement.getBoundingClientRect());
	}

	// cheeky but rotation changes indicate dpad size changing
	rotationValue = rotation.progress;

	pointerX = normalize(e.clientX - dpadLeft, dpadWidth);
	pointerY = -normalize(e.clientY - dpadTop, dpadHeight);
};

const handleInput = () => {
	const magnitude = Math.hypot(pointerX, pointerY);
	const notInDeadzone = magnitude > TILT_DEADZONE;

	const horz = Math.abs(pointerX);
	const vert = Math.abs(pointerY);

	// diagonal hit box is a small square in the corner
	const isDiagonal = Math.abs(pointerX) > DIAGONAL_MIN && Math.abs(pointerY) > DIAGONAL_MIN;
	const fireDiagonal = magnitude > DIAGONAL_MAGNITUDE_MIN && isDiagonal;

	for(const { type, isHorzAxis, sign } of DIRECTIONS) {
		const value = isHorzAxis ? pointerX : pointerY;
		const dominant = isHorzAxis ? horz > vert : vert > horz;
		const active = notInDeadzone && dominant && Math.sign(value) === sign;
		const wasActive = input.state[type];

		if(wasActive && !active) {
			input.fire({ type, state : RELEASED });
		} else if(active && !wasActive && !fireDiagonal) {
			input.fire({ type, state : TRIGGERED });
		}
	}

	if(fireDiagonal) {
		input.fire({ type : pointerX > 0 ? DPAD_RIGHT : DPAD_LEFT, state : TRIGGERED });
		input.fire({ type : pointerY > 0 ? DPAD_UP : DPAD_DOWN, state : TRIGGERED });
	}
};

const xDeg = $derived(`${roundHundredths(dpadY * MAX_TILT)}deg`);
const yDeg = $derived(`${roundHundredths(dpadX * MAX_TILT)}deg`);

$effect(() =>
	input.subscribe(() => {
		dpadX = -Number(input.state[DPAD_LEFT]) + Number(input.state[DPAD_RIGHT]);
		dpadY = Number(input.state[DPAD_UP]) + -Number(input.state[DPAD_DOWN]);
	}),
);
</script>

<div
	class={css.dpad}
	use:controls={{
		fire : (e) => {
			storeDpadState(e);
			handleInput();
		},
		end : () => {
			pointerX = 0;
			pointerY = 0;

			handleInput();
		},
	}}
	bind:this={dpadElement}
	style="transform: {getTransform(xDeg, yDeg)};"
>
	<div class={css.dpadface}></div>
	<div class={css.dpadbackface}></div>

	<div class={css.dpadcenterside}></div>
	<div class={css.dpadcenterside} data-left="true"></div>
</div>
