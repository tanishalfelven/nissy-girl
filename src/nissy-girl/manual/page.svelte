<script>
import { manualContentPages } from "./manual.data.js";

import css from "./page.mcss";

let {
	id,
	side,
	index,
	element = $bindable(false),
	isFolding = false,
} = $props();
</script>

<div
	class={css.page}
	bind:this={element}
	style:--zindex={manualContentPages.length - index}
	data-folding={isFolding}
>
	<div class={css.tempidentifier}>
		{id}
	</div>

	<div
		class={css.pagenumber}
		data-side={side}
	>
		{index}
	</div>
</div>
