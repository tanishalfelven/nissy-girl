<script>
import { roundHundredths, clamp } from "$util/math.js";
import { controls } from "$util/touch-action.svelte.js";

import css from "./dpad.mcss";

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
	class={css.dpad}
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
	<div class={css.dpadface}></div>
	<div class={css.dpadbackface}></div>

	<div class={css.dpadcenterside}></div>
	<div class={css.dpaccenterside} data-left="true"></div>
</div>
