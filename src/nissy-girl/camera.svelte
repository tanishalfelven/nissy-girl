<script>
import { touch } from "$util/touch-action.svelte.js";

import { gestureActor } from "$nissy-girl/gesture.machine.js";
import Cartridges from "$nissy-girl/cartridge/cartridges.svelte";
import { gesture } from "./gesture.viewmodel.svelte.js";

import Prompts from "./prompts/prompts.svelte";
import NissyGirl from "./nissy-girl.svelte";

import css from "./camera.mcss";
import { noopFalseFunction } from "$util/noop.js";
import { cartridges } from "./cartridge/cartridge.viewmodel.svelte.js";

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

	<div
		class={css.manual}
		data-hide={cartridges.isVisible}
		data-background={gesture.isDeviceFocused}
		data-animate={gesture.shouldAnimate}
		use:touch={{
			start : () => {
				if(gesture.isDeviceFocused) {
					// manual must pass a request due to complicated entry conditions
					gestureActor.send({ type : "REQUEST_MANUAL" });

					return;
				}
			},
			move : noopFalseFunction,
			end : noopFalseFunction,
		}}
	></div>
</div>
