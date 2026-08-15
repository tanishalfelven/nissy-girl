<script>
import css from "./toolbar.mcss";
import PencilPng from "./assets/pencil.png";
import Palette from "./palette.svelte";

import { COLORS } from "../util/colors.js";

const { model } = $props();

const selectedColor = $derived.by(() => model.selectedColor);

const selectedColorValue = $derived(COLORS.get(selectedColor));

const selectedColorRGB = $derived(`rgb(${selectedColorValue[0]}, ${selectedColorValue[1]}, ${selectedColorValue[2]})`);
</script>

<div
	class={css.cursor}
	style:left=""
	style:top=""
	style="transform:
		translate(
			calc({model.cursor.x} * var(--spx)),
			calc({model.cursor.y} * var(--spx))
		)
		scale(0.9);
		width: calc({model.scale} * var(--spx));
		height: calc({model.scale} * var(--spx));
	"
>
</div>

<div class={css.tools} data-show={model.showUI}>
	<div class={css.tool}>
		<div class={css.toolimg} style:--img="url({PencilPng})"></div>
	</div>

	<div class={css.selectedcolor} style:--color={selectedColorRGB}></div>

	<Palette {model} />

	<div class={css.toolbarmenu} data-show={model.showTools}>
		<div class={css.newartboard}></div>
	</div>
</div>
