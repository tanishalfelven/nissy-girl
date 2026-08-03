<script>
import css from "./screens.mcss";

import { screenRuntime } from "./screen.actor.js";

let { children } = $props();

let canvasEl = $state(false);

$effect(() => {
	if(canvasEl && screenRuntime.getIsActive() && !screenRuntime.isInitialized()) {
		screenRuntime.initialize(canvasEl);
	}
});
</script>

<div class={css.screenborder}>
	<div class={css.screencontainer}>
		<canvas bind:this={canvasEl} class={css.screen}></canvas>

		<div class={css.screenoverlay}>
			{@render children?.()}
		</div>
	</div>
</div>
