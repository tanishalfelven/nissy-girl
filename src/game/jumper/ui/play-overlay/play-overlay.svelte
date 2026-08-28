<script>
import Countdown from "./countdown.svelte";

const { model } = $props();

import css from "./play-overlay.mcss";
</script>

<div class={css.game}>
	<div class={css.timer}>{model.elapsedTime}</div>

	<div class={css.coins}>{model.collectedCoins} / {model.maxCoins}</div>

	{#if !model.isPlaying}
		<Countdown { model } />
	{/if}
</div>
