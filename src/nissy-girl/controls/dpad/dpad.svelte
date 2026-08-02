<script>
import { roundHundredths, clamp } from "$util/math.js";
import { controls } from "$util/touch-action.svelte.js";

import css from "./dpad.mcss";
import { rotation } from "$nissy-girl/camera.viewmodel.svelte.js";
import { input } from "$nissy-girl/input.svelte.js";
import {
	TRIGGERED,
	RELEASED,
	DPAD_DOWN,
	DPAD_LEFT,
	DPAD_RIGHT,
	DPAD_UP,
} from "$games/shared/input.consts.js";

const MAX_TILT = 3;
const TILT_DEADZONE = 0.4;

let dpadElement = false;

let dpadX = $state(0);
let dpadY = $state(0);

let dpadLeft = 0;
let dpadTop = 0;
let dpadWidth = 0;
let dpadHeight = 0;

let isTouchControls = $state(false);

let rotationValue = 0;

const xDeg = $derived(`${roundHundredths(dpadY * MAX_TILT)}deg`);
const yDeg = $derived(`${roundHundredths(dpadX * MAX_TILT)}deg`);

input.subscribe(() => {
	if(isTouchControls) {
		return;
	}

	dpadX = -Number(input.state[DPAD_LEFT]) + Number(input.state[DPAD_RIGHT]);
	dpadY = -Number(input.state[DPAD_UP]) + Number(input.state[DPAD_DOWN]);
});

const handleInput = () => {
	const xTriggered = Math.abs(dpadX) > TILT_DEADZONE;
	const yTriggered = Math.abs(dpadY) > TILT_DEADZONE;

	const isLeft = dpadX < 0;
	const isRight = dpadX > 0;
	const isUp = dpadY > 0;
	const isDown = dpadY < 0;

	const wasLeft = input.state[DPAD_LEFT];
	const wasRight = input.state[DPAD_RIGHT];
	const wasUp = input.state[DPAD_UP];
	const wasDown = input.state[DPAD_DOWN];

	if(wasLeft && !isLeft) {
		input.fire({ type : DPAD_LEFT, state : RELEASED });
	} else if(wasRight && !isRight) {
		input.fire({ type : DPAD_RIGHT, state : RELEASED });
	}

	if(wasUp && !isUp) {
		input.fire({ type : DPAD_UP, state : RELEASED });
	} else if(wasDown && !isDown) {
		input.fire({ type : DPAD_DOWN, state : RELEASED });
	}

	if(xTriggered && isLeft && !wasLeft) {
		input.fire({ type : DPAD_LEFT, state : TRIGGERED });
	} else if(xTriggered && isRight && !wasRight) {
		input.fire({ type : DPAD_RIGHT, state : TRIGGERED });
	}

	if(yTriggered && isUp && !wasUp) {
		input.fire({ type : DPAD_UP, state : TRIGGERED });
	} else if(yTriggered && isDown && !wasDown) {
		input.fire({ type : DPAD_DOWN, state : TRIGGERED });
	}
};

const setRotation = (e) => {
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

	rotationValue = rotation.progress;

	const normalizedX = ((e.clientX - dpadLeft) / dpadWidth) * 2 - 1;
	const normalizedY = ((e.clientY - dpadTop) / dpadHeight) * 2 - 1;

	// we clamp tilt because the dpad hitbox is a bit generous
	dpadX = clamp(normalizedX, -1, 1);
	dpadY = clamp(-normalizedY, -1, 1);
};

const getTransform = (x, y) => {
	if(dpadX === 0 && dpadY === 0) {
		return "";
	}

	return `translateZ(var(--button-plane)) rotateX(${x}) rotateY(${y}) scale(0.98)`;
};
</script>

<div
	class={css.dpad}
	use:controls={{
		fire : (e) => {
			isTouchControls = true;
			setRotation(e);
			handleInput();
		},
		end : () => {
			isTouchControls = false;
			dpadX = 0;
			dpadY = 0;

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
