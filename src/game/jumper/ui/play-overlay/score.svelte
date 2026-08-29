<script>
import { SCORE_OPTIONS, EXIT } from "./score.consts.js";

import css from "./score.mcss";

const { model } = $props();

const scoreNav = model.createNav({
	id : "score",
	initial : EXIT,
	keys : SCORE_OPTIONS,
});
</script>

<div class={css.scorecontainer}>
	<div class={css.score}>
		<div class={css.scorelabel}>SCORE</div>
		<div class={css.scorevalue}>{model.score}</div>
	</div>

	<div class={css.scorenav}>
		{#each SCORE_OPTIONS as option}
			<div class={css.button} use:scoreNav.navPoint>
				{option}
			</div>
		{/each}
	</div>
</div>
