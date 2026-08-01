<script module>
import { controls } from "../../../util/touch-action.svelte.js";

import css from "./button.mcss";

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
	class={css.button}
	data-type={type}
	data-button={button}
	style="transform: {getTransform(isPressed)};"
>
	{#if type === TYPE_ROUND}
		<div class={css.roundside}></div>
	{:else if type === TYPE_BEAN}
		<div class={css.beanside}></div>
		<div class={css.beanside} data-right="true"></div>
	{/if}
</div>
