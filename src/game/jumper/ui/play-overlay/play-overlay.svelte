<script>
const { model, children } = $props();

import css from "./play-overlay.mcss";
</script>

<div class={css.game}>
	{@render children?.()}

	{#if model.seed}
		<div class={css.seed}>
			{model.seed}
		</div>
	{/if}

	{#if model.displayTime()}
		<div class={css.timer}>{model.elapsedTime}</div>
	{/if}

	{#if model.collectedCoins > 0}
		<div class={css.coins}>{model.collectedCoins}</div>
	{/if}
</div>
