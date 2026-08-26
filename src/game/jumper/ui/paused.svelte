<script>
import css from "./paused.mcss";

const { model } = $props();

import { PAUSED_OPTIONS, CONTINUE } from "./paused.consts.js";

const pauseNav = model.createNav({
	id : "paused",
	initial : CONTINUE,
	keys : PAUSED_OPTIONS,
});
</script>

<div class={css.paused}>
	<div class={css.header}>PAUSED</div>

	<div class={css.options}>
		{#each PAUSED_OPTIONS as option}
			<div class={css.button} use:pauseNav.navPoint>
				{option}
			</div>
		{/each}
	</div>
</div>
