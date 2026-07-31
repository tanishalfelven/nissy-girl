<script module>
export const BUTTON_A = "a";
export const BUTTON_B = "b";
export const BUTTON_START = "start";
export const BUTTON_SELECT = "select";

const BUTTONS_BEAN = new Set([ BUTTON_START, BUTTON_SELECT ]);
const BUTTONS_ROUND = new Set([ BUTTON_A, BUTTON_B ]);

const TYPE_BEAN = "bean";
const TYPE_ROUND = "round";

const getButtonType = (button) => {
	console.log(button, BUTTONS_BEAN);

	if(BUTTONS_BEAN.has(button)) {
		return TYPE_BEAN;
	}

	if(BUTTONS_ROUND.has(button)) {
		return TYPE_ROUND;
	}
};
</script>
<script>
import { controls } from "../util/touch-action.svelte.js";

let { button } = $props();

let isPressed = $state(false);

const type = $derived(getButtonType(button));

const getTransform = (isPressed) => {
	if(isPressed) {
		return "translateZ(calc(var(--depth-w) / 1.94)) scale(0.95)";
	}

	if(type === TYPE_BEAN) {
		return "translateZ(calc(var(--depth-w) / 1.88))";
	}

	return "translateZ(calc(var(--depth-w) / 1.8))";
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
	class="face {type} {button}"
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
	right: 9%;
	bottom: 31%;

	background-image: url("./assets/button-a.png");
}

.b {
	right: 26.75%;
	bottom: 26%;

	background-image: url("./assets/button-b.png");
}

.start {
	right: calc(48.8 / 142 * 100%);
}

.select {
	left: calc(47 / 142 * 100%);
}

.bean {
	position: absolute;

	bottom: calc(94 / 224 * 100%);

	aspect-ratio: 17 / 5;

	width: calc(17 / 142 * 100%);

	transform-style: preserve-3d;

	background-image: url("./assets/button-bean.png");
}

.bean-side {
	aspect-ratio: 3 / 5;

	height: 100%;

	position: absolute;

	top: 0;
	left: 0;

	transform: rotateY(90deg) translateX(50%);

	background-image: url("./assets/button-bean-side.png");
}

.bean-side.right {
	left: auto;
	right: 0;

	transform: rotateY(-90deg) translateX(-50%);
}

.round {
	position: absolute;

	aspect-ratio: 1 / 1;

	width: var(--round-button-w);

	transform-style: preserve-3d;
}

.round-side {
	aspect-ratio: 3 / 9;

	height: 100%;

	transform: rotateY(90deg) translateX(50%) translateZ(calc(var(--round-button-w) / 3.2));

	background-image: url("./assets/button-round-side.png");

	backface-visibility: visible !important;
	-webkit-backface-visibility: visible !important;
}
</style>
