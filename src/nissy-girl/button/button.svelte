<script module>
export const TYPE_BUTTON_A = "a";
export const TYPE_BUTTON_B = "b";
</script>
<script>
import { controls } from "../util/touch-action.svelte.js";

let{ type = TYPE_BUTTON_A } = $props();

let isPressed = $state(false);

const getTransform = (isPressed) => {
	if(isPressed) {
		return "translateZ(calc(var(--depth-w) / 1.94)) scale(0.95)";
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
	class="face button {type}"
	style="transform: {getTransform(isPressed)};"
>
	<div class="face button-side"></div>
</div>

<style>
.a {
	right: 9%;
	bottom: 31%;

	background-image: url("../assets/button-a.png");
}

.b {
	right: 26.75%;
	bottom: 26%;

	background-image: url("../assets/button-b.png");
}

.button {
	position: absolute;

	aspect-ratio: 1 / 1;

	width: var(--round-button-w);

	transform-style: preserve-3d;
	will-change: transform;
}

.button-side {
	aspect-ratio: 3 / 9;

	height: 100%;

	transform: rotateY(90deg) translateX(50%) translateZ(calc(var(--round-button-w) / 3.2));

	background-image: url("../assets/button-round-side.png");

	backface-visibility: visible !important;
	-webkit-backface-visibility: visible !important;
}
</style>
