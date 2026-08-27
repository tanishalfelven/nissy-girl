<script>
import css from "./play-overlay.mcss";

import { Tween } from "svelte/motion";

const { model } = $props();

const END_COUNT = -1;
const START_COUNT = 3;
const COUNT_DURATION = (START_COUNT + Math.abs(END_COUNT)) * 1000;
const PLAY_COUNT = 0;

const countdownTween = new Tween(START_COUNT, { duration : COUNT_DURATION });

countdownTween.target = END_COUNT;

const count = $derived(Math.ceil(countdownTween.current));

$effect(() => {
	if(count === PLAY_COUNT) {
		model.startGame();
	}
});
</script>

<div class={css.game}>
	{#if count > END_COUNT}
		{@const finishCount = count <= PLAY_COUNT}

		{#key finishCount ? "done" : count}
			<div class={css.count}>
				{#if finishCount}
					GO!
				{:else}
					{count}
				{/if}
			</div>
		{/key}
	{/if}
</div>
