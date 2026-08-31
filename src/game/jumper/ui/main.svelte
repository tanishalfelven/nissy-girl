<script>
import { MENU_OPTIONS, DAILY_TRIAL } from "./main.consts.js";

import css from "./main.mcss";

const { model } = $props();
const menuNav = model.createNav({
	id : "menu",
	initial : DAILY_TRIAL,
	keys : MENU_OPTIONS,
});
</script>

<div class={css.menu}>
	<div class={css.jumper}></div>
	<div class={css.titlecard}></div>

	<div class={css.menunav}>
		{#each MENU_OPTIONS as option}
			<div class={css.button} use:menuNav.navPoint>
				{option}
			</div>
		{/each}
	</div>
</div>
