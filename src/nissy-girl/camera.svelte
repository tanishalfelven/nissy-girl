<script>
import { touch } from "$util/touch-action.svelte.js";

import { gestureActor } from "$nissy-girl/gesture.machine.js";
import Cartridges from "$nissy-girl/device/cartridge/cartridges.svelte";

import Prompts from "./prompts/prompts.svelte";
import NissyGirl from "./device/nissy-girl.svelte";
import Manual from "./manual/manual.svelte";

import css from "./camera.mcss";

let { children } = $props();

let nissyGirlWidth = $state(false);
</script>

<Prompts/>
<Cartridges />

<div
	class={css.camera}
	use:touch={{
		start : () =>
			gestureActor.send({
				type : "DRAG_START",
			}),
		move : (distX, distY) => {
			if(distX === 0 || nissyGirlWidth <= 0) {
				return;
			}

			gestureActor.send({
				type : "DRAG_DELTA",
				// X is our main axis
				delta : distX / nissyGirlWidth,
				// Y is supplementary, some actions ignore it
				deltaY : distY / nissyGirlWidth,
			});
		},
		end : () =>
			gestureActor.send({
				type : "DRAG_END",
			}),
	}}
>
	<NissyGirl bind:nissyGirlWidth>
		{@render children?.()}
	</NissyGirl>

	<Manual />
</div>
