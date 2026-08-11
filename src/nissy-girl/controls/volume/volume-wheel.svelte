<script>
import { controls } from "$util/touch-action.svelte.js";
import css from "./volume-wheel.mcss";
import { audio } from "$nissy-girl/sound/audio.svelte.js";

const MAX_ROT = 105;
const ANGLE_OFFSET = 7;

const step = (val, stepBy) => Math.round(val / stepBy) * stepBy;
const volumeToSteppedRotation = () => (MAX_ROT - step(audio.volume * MAX_ROT, 7) - ANGLE_OFFSET);

let sliderHeight = $state(false);
let lastY = $state(0);

const rotation = $derived(volumeToSteppedRotation(audio.volume));
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

				audio.setVolume(audio.volume - dragDist);
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
