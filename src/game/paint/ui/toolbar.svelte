<script>
import css from "./toolbar.mcss";
import PencilPng from "./assets/pencil.png";

const { model } = $props();
</script>

{#if model.showUI}
	<div class={css.tools}>
		<div class={css.tool}>
			<div class={css.toolimg} style:--img="url({PencilPng})"></div>
		</div>

		<div class={css.selectedcolor}>
			<div class={css.color} style:--color="#000"></div>
		</div>
	</div>
{/if}
