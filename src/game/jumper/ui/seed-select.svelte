<script>
import css from "./seed-select.mcss";

const indexes = [ 0, 1, 2, 3, 4, 5 ];

const { model } = $props();
const seedNav = model.createNav({
	id : "seed",
	initial : 0,
	keys : indexes,
});
</script>

<div class={css.seed}>
	<div class={css.prompt}>select a seed</div>

	<div class={css.seednav}>
		{#each indexes as option}
			<div class={css.seedindex}>
				<div class={css.increment} data-bling={seedNav.active === option && model.increment}>▲</div>

				<div class={css.button} use:seedNav.navPoint>
					{model.seed[option]}
				</div>

				<div class={css.decrement} data-bling={seedNav.active === option && model.decrement}>▼</div>
			</div>
		{/each}
	</div>
</div>
