<script>
import css from "./drawing.mcss";
import Palette from "./palette.svelte";
import Toolbar from "./toolbar.svelte";

import { COLORS } from "../util/colors.js";
import { TOOLS } from "./tools.consts.js";

const { model } = $props();

const selectedColorValue = $derived(COLORS.get(model.getColor()));

const selectedColorRGB = $derived(`rgb(${selectedColorValue[0]}, ${selectedColorValue[1]}, ${selectedColorValue[2]})`);

const activeToolPng = $derived(TOOLS.get(model.tool).lined);
</script>

<div
	class={css.cursor}
	style:--color={selectedColorRGB}
	data-toolactive={model.toolActive}
	style="
		--scale: {model.scale}rem;
		transform:
			translate(
				{model.cursor.x}rem,
				{model.cursor.y}rem
			)
			scale(0.9);"
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
