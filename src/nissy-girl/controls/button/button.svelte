<script module>
import { controls } from "$util/touch-action.svelte.js";
import { input } from "$nissy-girl/input.js";
import {
	BUTTON_A,
	BUTTON_B,
	BUTTON_SELECT,
	BUTTON_START,
	RELEASED,
	TRIGGERED,
} from "$games/shared/input.consts.js";

export {
	BUTTON_A,
	BUTTON_B,
	BUTTON_SELECT,
	BUTTON_START,
} from "$games/shared/input.consts.js";

import css from "./button.mcss";

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

input.subscribe(({ type, state }) => {
	if(type === button) {
		isPressed = state === TRIGGERED;
	}
});

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
			if(isPressed) {
				return;
			}

			input.fire({ type : button, state : TRIGGERED });

			isPressed = true;
		},
		end : () => {
			if(!isPressed) {
				return;
			}

			input.fire({ type : button, state : RELEASED });

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
