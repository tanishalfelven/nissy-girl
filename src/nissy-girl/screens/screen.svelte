<script module>
let canvasEl = $state(false);

export const getCanvas = () => {
	return canvasEl;
};
</script>
<script>
import css from "./screens.mcss";

let { children } = $props();
</script>

<div class={css.screenborder}>
	<div class={css.screencontainer}>
		<canvas bind:this={canvasEl} class={css.screen}></canvas>

		<div class={css.screenoverlay}>
			{@render children?.()}
		</div>
	</div>
</div>
