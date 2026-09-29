<script>
import { handleEvent, touch } from "$util/touch-action.svelte.js";
import { noopFalseFunction } from "$util/noop.js";

import { gestureActor } from "$nissy-girl/gesture.machine.js";
import { gesture } from "$nissy-girl/gesture.viewmodel.svelte.js";

import { cartridges } from "$nissy-girl/device/cartridge/cartridge.viewmodel.svelte.js";

import { manualContentPages } from "./manual.data.js";

import css from "./manual.mcss";
</script>

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
		handleEvent : (e) => {
			if(gesture.isDeviceFocused) {
				handleEvent(e);
			}
		},
	}}
>
	{#each manualContentPages as { id, side }, index}
		<div
			class={css.page}
			data-side={side}
			data-id={id}
			style:z-index={manualContentPages.length - index}
		>
			<div class={css.tempidentifier}>
				{id}
			</div>

			<div
				class={css.pagenumber}
				data-side={side}
			>
				{index}
			</div>
		</div>
	{/each}
</div>
