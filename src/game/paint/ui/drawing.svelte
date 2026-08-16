<script>
import css from "./drawing.mcss";
import Palette from "./palette.svelte";
import Toolbar from "./toolbar.svelte";

import { COLORS } from "../util/colors.js";
import { TOOLS } from "./tools.consts.js";

const { model } = $props();

const selectedColor = $derived.by(() => model.selectedColor);

const selectedColorValue = $derived(COLORS.get(selectedColor));

const selectedColorRGB = $derived(`rgb(${selectedColorValue[0]}, ${selectedColorValue[1]}, ${selectedColorValue[2]})`);

const activeToolPng = $derived(TOOLS.get(model.tool).lined);
</script>

<div
	class={css.cursor}
	style:--color={selectedColorRGB}
	data-toolactive={model.toolActive}
	style="transform:
			translate(
				calc({model.cursor.x} * var(--spx)),
				calc({model.cursor.y} * var(--spx))
			)
			scale(0.9);
		width: calc({model.scale} * var(--spx));
		height: calc({model.scale} * var(--spx));"
>
</div>

<div class={css.tools} data-show={model.showUI}>
	<div class={css.tool}>
		<div class={css.toolimg} style:--img="url({activeToolPng})"></div>
	</div>

	<div class={css.selectedcolor} style:--color={selectedColorRGB}></div>

	<Palette {model} />

	<Toolbar {model} />
</div>
