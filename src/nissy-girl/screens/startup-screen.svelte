<script>
import { onMount } from "svelte";

import StartupScreenGif from "./assets/startup-screen.gif?no-inline";

import css from "./screens.mcss";

import { audio } from "$nissy-girl/sound/audio.js";

onMount(() => {
	audio.playBootJingle();

	return () => {
		audio.stopBootJingle();
	};
});

const time = Date.now();
</script>

<img src={`${StartupScreenGif}?t=${time}`} alt="startup gif" class={css.startupscreen} />
