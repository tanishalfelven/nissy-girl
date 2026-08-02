<script>
import css from "./game.mcss";

import { isGameReady, registerCanvasToGame } from "./game.actor.js";

let canvasEl = $state(false);

$effect(() => {
	if(canvasEl && isGameReady()) {
		registerCanvasToGame(canvasEl);
	}
});
</script>

<canvas bind:this={canvasEl} class={css.canvas}></canvas>
