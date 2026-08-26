<script>
import { deadzone } from "$util/touch-action.svelte.js";

import css from "./round-housing.mcss";

let { children } = $props();
</script>

<div class={css.deadzone} use:deadzone>
	<div class={css.unrotate}>
		{@render children?.()}
	</div>

	<div class={css.housing}></div>
</div>
