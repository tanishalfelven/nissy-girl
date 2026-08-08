<script>
import { controls } from "$util/touch-action.svelte.js";
import css from "./volume-wheel.mcss";

import { clamp } from "$util/math.js";

const step = (val, stepBy) => Math.round(val / stepBy) * stepBy;

const MAX_ROT = 105;
const ANGLE_OFFSET = 7;

let sliderHeight = $state(false);
let lastY = $state(0);

let volume = $state(0.25);

const rotation = $derived(`${MAX_ROT - step(volume * MAX_ROT, 7) - ANGLE_OFFSET}deg`);
</script>

<div
	class={css.housing}
	style:--rotation={rotation}
	bind:clientHeight={sliderHeight}
	use:controls={{
		fire : (e) => {
			if(!sliderHeight) {
				return false;
			}

			const newY = e.clientY;

			if(lastY) {
				let dragDist = (newY - lastY) / sliderHeight * 0.3;

				volume = clamp(volume - dragDist, 0, 1);
			}

			lastY = newY;
		},
		end : () => {
			lastY = 0;
		},
	}}
>
	<div class={css.wheel} data-back="true">
		<div class={css.wheeltick}></div>
	</div>
	<div class={css.wheel} data-front="true"></div>
</div>
