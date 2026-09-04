<script>
import css from "./palette.mcss";

import { COLORS } from "../util/colors.js";

const { model } = $props();

const paletteNav = model.createNav({
	id : "palette",
	initial : model.getColor(),
	keys : [ ...COLORS.keys() ],
});
</script>

<div class={css.palette} data-show={model.showPalette}>
	{#each COLORS.values() as [ r, g, b ]}
		<div
			class={css.palettecolor}
			style:--color={`rgb(${r}, ${g}, ${b})`}
			use:paletteNav.navPoint
		>
		</div>
	{/each}
</div>
