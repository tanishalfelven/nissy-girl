<script module>
// normalize to -1 to 1, no clamp because ACTUALLY we need that data
const normalize = (pos, max) => (pos / max) * 2 - 1;

const DIRECTIONS = [
	{ type : DPAD_LEFT, isHorzAxis : true, sign : -1 },
	{ type : DPAD_RIGHT, isHorzAxis : true, sign : 1 },
	{ type : DPAD_UP, isHorzAxis : false, sign : 1 },
	{ type : DPAD_DOWN, isHorzAxis : false, sign : -1 },
];
</script>
<script>
import { roundHundredths } from "$util/math.js";
import { controls } from "$util/touch-action.svelte.js";

import css from "./dpad.mcss";
import { rotation } from "$nissy-girl/camera.viewmodel.svelte.js";
import { input } from "$nissy-girl/input.js";
import {
	DPAD_DOWN,
	DPAD_LEFT,
	DPAD_RIGHT,
	DPAD_UP,
	TRIGGERED,
	RELEASED,
} from "$game/shared/input.consts.js";

const MAX_TILT = 3;
const DEADZONE = 0.15;
const DIAGONAL_RATIO = 0.55;
const RADIUS = 0.6;

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

let originX = 0;
let originY = 0;

let heldX = 0;
let heldY = 0;

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
	const dx = pointerX - originX;
	const dy = pointerY - originY;

	const dist = Math.hypot(dx, dy);
	const live = dist > DEADZONE;

	const nextX = live && Math.abs(dx) > Math.abs(dy) * DIAGONAL_RATIO ? Math.sign(dx) : 0;
	const nextY = live && Math.abs(dy) > Math.abs(dx) * DIAGONAL_RATIO ? Math.sign(dy) : 0;

	for(const { type, isHorzAxis, sign } of DIRECTIONS) {
		const active = (isHorzAxis ? nextX : nextY) === sign;
		const wasActive = (isHorzAxis ? heldX : heldY) === sign;

		if(active && !wasActive) {
			input.fire({ type, state : TRIGGERED });
		} else if(wasActive && !active) {
			input.fire({ type, state : RELEASED });
		}
	}

	heldX = nextX;
	heldY = nextY;

	if(dist > RADIUS) {
		const excess = (dist - RADIUS) / dist;
		originX += dx * excess;
		originY += dy * excess;
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
			originX = 0;
			originY = 0;

			handleInput();
		},
	}}
	bind:this={dpadElement}
	style="transform: translateZ(var(--button-plane)) rotateX({xDeg}) rotateY({yDeg}) scale(0.98);"
>
	<div class={css.dpadface}></div>
	<div class={css.dpadbackface}></div>

	<div class={css.dpadcenterside}></div>
	<div class={css.dpadcenterside} data-left="true"></div>
</div>
