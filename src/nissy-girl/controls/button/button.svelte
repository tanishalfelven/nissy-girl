<script module>
import { controls } from "../../util/touch-action.svelte.js";

export const BUTTON_A = "a";
export const BUTTON_B = "b";
export const BUTTON_START = "start";
export const BUTTON_SELECT = "select";

const BUTTONS_BEAN = new Set([ BUTTON_START, BUTTON_SELECT ]);
const BUTTONS_ROUND = new Set([ BUTTON_A, BUTTON_B ]);

const TYPE_BEAN = "bean";
const TYPE_ROUND = "round";

const getButtonType = (button) => {
	if(BUTTONS_BEAN.has(button)) {
		return TYPE_BEAN;
	}

	if(BUTTONS_ROUND.has(button)) {
		return TYPE_ROUND;
	}
};
</script>
<script>
let { button } = $props();

let isPressed = $state(false);

const type = $derived(getButtonType(button));

const getTransform = (isPressed) => {
	if(isPressed) {
		return "translateZ(calc(var(--button-plane) * 0.4)) scale(0.92)";
	}

	if(type === TYPE_BEAN) {
		return "translateZ(calc(var(--button-plane) * 0.6))";
	}

	return "translateZ(var(--button-plane))";
};
</script>

<div
	use:controls={{
		fire : () => {
			isPressed = true;
		},
		end : () => {
			isPressed = false;
		},
	}}
	class="face touch-interactive button {type} {button}"
	style="transform: {getTransform(isPressed)};"
>
	{#if type === TYPE_ROUND}
		<div class="face round-side"></div>
	{:else if type === TYPE_BEAN}
		<div class="face bean-side left"></div>
		<div class="face bean-side right"></div>
	{/if}
</div>

<style>
.a {
	right: calc(8 * var(--1px));
	bottom: calc(65 * var(--1px));

	padding-left: calc(3.5 * var(--1px)) !important;

	background-image: url("./assets/button-a.png");
}

.b {
	right: calc(34.5 * var(--1px));
	bottom: calc(54 * var(--1px));

	padding-right: calc(3.5 * var(--1px)) !important;

	background-image: url("./assets/button-b.png");
}

.start {
	right: calc(47 * var(--1px));
}

.select {
	left: calc(45 * var(--1px));
}

.button {
	padding: calc(2 * var(--1px));

	background-origin: content-box;
}

.bean {
	aspect-ratio: 17 / 5;

	position: absolute;

	padding-bottom: calc(8 * var(--1px));

	bottom: calc(86 * var(--1px));

	width: calc(17 * var(--1px));

	transform-style: preserve-3d;

	background-image: url("./assets/button-bean.png");
}

.bean-side {
	aspect-ratio: 3 / 5;

	height: calc(5 * var(--1px));

	position: absolute;

	top: calc(2 * var(--1px));
	left: calc(2 * var(--1px));

	margin: auto;

	transform: rotateY(-90deg) translateX(-50%);

	background-image: url("./assets/button-bean-side.png");

	backface-visibility: visible !important;
	-webkit-backface-visibility: visible !important;
}

.bean-side.right {
	left: auto;
	right: calc(2 * var(--1px));

	transform: rotateY(90deg) translateX(50%);
}

.round {
	aspect-ratio: 1 / 1;

	padding: calc(5 * var(--1px));

	position: absolute;

	width: calc(18 * var(--1px));

	transform-style: preserve-3d;
}

.round-side {
	aspect-ratio: 3 / 9;

	height: calc(18 * var(--1px));

	transform: rotateY(90deg) translateX(50%) translateZ(calc(8 * var(--1px)));

	background-image: url("./assets/button-round-side.png");

	backface-visibility: visible !important;
	-webkit-backface-visibility: visible !important;
}
</style>
