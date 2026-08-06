<script module>
// normalize to -1 to 1, no clamp because ACTUALLY we need that data
const normalize = (pos, max) => (pos / max) * 2 - 1;

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
const RELATIVE_INTENT_MIN = 0.35;
const CHANGE_STARTED_MIN = 0.32;
const RELATIVE_DIAGONAL_MIN_SLOPE = 0.45;

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

let isHeld = false;
let originX = 0;
let originY = 0;

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
	const isRelative = isHeld;

	let dx = pointerX - originX;
	let dy = pointerY - originY;

	let forceOriginOverwrite = false;

	const magnitude = Math.hypot(dx, dy);
	// relative moves disregard deadzone
	const notInDeadzone = (magnitude > TILT_DEADZONE) && !isRelative;

	const horz = Math.abs(dx);
	const vert = Math.abs(dy);

	const isInitialDiagonal = horz > DIAGONAL_MIN && vert > DIAGONAL_MIN;
	const startsInDiagonalSector = magnitude > DIAGONAL_MAGNITUDE_MIN && isInitialDiagonal;

	// resolving relative drag to input is a whole thing but it feels better damnit
	const isRelativeMove = (magnitude > RELATIVE_INTENT_MIN) && isRelative;
	const isRelativeDiagonal = isRelativeMove
		&& ((Math.min(horz, vert) / Math.max(horz, vert)) > RELATIVE_DIAGONAL_MIN_SLOPE);

	const detectedChange = isRelative && !isRelativeMove
		&& (magnitude > CHANGE_STARTED_MIN);

	if(isRelative && (!isRelativeMove && !isRelativeDiagonal && !detectedChange)) {
		return;
	}

	const isValidDiagonal = (isRelative && isRelativeDiagonal) || startsInDiagonalSector;

	for(const { type, isHorzAxis, sign } of DIRECTIONS) {
		const value = isHorzAxis ? dx : dy;
		const dominant = isHorzAxis ? horz > vert : vert > horz;
		const active = (notInDeadzone || isRelativeMove)
			&& (dominant || isValidDiagonal)
			&& Math.sign(value) === sign;
		const wasActive = input.state[type];

		if((wasActive && !active) || (detectedChange && wasActive)) {
			forceOriginOverwrite = true;

			input.fire({ type, state : RELEASED });
		} else if(active && !wasActive) {
			forceOriginOverwrite = !isHeld;

			isHeld = true;

			input.fire({ type, state : TRIGGERED });
		}
	}

	// Change doens't ever save and is just an optimistic cancel around held inputs when we detect that change is likely to occur
	if(detectedChange) {
		return;
	}

	if((isRelative && (isRelativeMove || isRelativeDiagonal)) || forceOriginOverwrite) {
		originX = pointerX;
		originY = pointerY;
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
			isHeld = false;
			pointerX = 0;
			pointerY = 0;
			originX = 0;
			originY = 0;

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
