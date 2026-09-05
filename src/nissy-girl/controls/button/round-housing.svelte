<script>
import { deadzone, handleEvent } from "$util/touch-action.svelte.js";
import { nissyGirl } from "$nissy-girl/nissy-girl.viewmodel.svelte.js";

import css from "./round-housing.mcss";

let { children } = $props();
</script>

<div class={css.deadzone} use:deadzone={(e) => {
	if(nissyGirl.isPowered) {
		handleEvent(e);
	}
}}>
	<div class={css.unrotate}>
		{@render children?.()}
	</div>

	<div class={css.housing}></div>
</div>
