<script>
import css from "./toolbar.mcss";

import { TOOLS } from "./tools.consts.js";

const { model } = $props();

const toolNav = model.createNav({
	id : "tool",
	initial : model.tool,
	keys : [ ...TOOLS.keys() ],
});
</script>

<div class={css.toolbarmenu} data-show={model.showTools}>
	{#each TOOLS.values() as { unlined }}
		<div
			class={css.tooloption}
			style:--img="url({unlined})"
			use:toolNav.navPoint
		>
		</div>
	{/each}
</div>
