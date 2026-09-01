<script>
import { controls } from "$util/touch-action.svelte.js";
import css from "./volume-wheel.mcss";
import { volume } from "$nissy-girl/sound/volume.svelte.js";
import { audio } from "$nissy-girl/sound/audio.js";

import { step } from "$util/math.js";

const MAX_ROT = 105;
const ANGLE_OFFSET = 7;

const volumeToSteppedRotation = () => (MAX_ROT - step(volume.value * MAX_ROT, 7) - ANGLE_OFFSET);

let sliderHeight = $state(false);
let lastY = $state(0);

const rotation = $derived(volumeToSteppedRotation(volume.value));
let hasPlayed = $state(volumeToSteppedRotation());

$effect(() => {
	if(rotation !== hasPlayed) {
		audio.playVolumeKnob();

		hasPlayed = rotation;
	}
});
</script>

<div
	class={css.housing}
	style:--rotation="{rotation}deg"
	bind:clientHeight={sliderHeight}
	use:controls={{
		fire : (e) => {
			if(!sliderHeight) {
				return false;
			}

			const newY = e.clientY;

			if(lastY) {
				let dragDist = (newY - lastY) / sliderHeight / 5;

				volume.set(volume.value - dragDist);
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
