<script module>
const END_COUNT = -1;
const START_COUNT = 3;
const COUNT_DURATION = (START_COUNT + Math.abs(END_COUNT)) * 1000;
const PLAY_COUNT = 0;
</script>
<script>
import css from "./countdown.mcss";
import { audio } from "$nissy-girl/sound/audio.js";

import { Tween } from "svelte/motion";

const { model } = $props();

const countdownTween = new Tween(START_COUNT, { duration : COUNT_DURATION });
const count = $derived(Math.ceil(countdownTween.current));

countdownTween.target = END_COUNT;

$effect(() => {
	if(count === PLAY_COUNT) {
		model.startGame();
		audio.jumper.playFinishCountBeep();
	} else {
		audio.jumper.playCountBeep();
	}
});
</script>

{#if count >= END_COUNT}
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
