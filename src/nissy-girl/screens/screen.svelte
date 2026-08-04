<script module>
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./screen.consts.js";
import { createRenderer } from "./render.js";
import { nissyGirlActor } from "$nissy-girl/nissy-girl.machine.js";
import { Assets } from "pixi.js";

let renderer = false;

const initRenderer = async (canvas) => {
	renderer = await createRenderer(canvas, { width : CANVAS_WIDTH, height : CANVAS_HEIGHT });

	await Assets.init();

	nissyGirlActor.send({ type : "RENDERER_READY" });
};

export const screen = {
	render(renderables) {
		if(!renderer) {
			throw new Error("Render scene called before renderer init!");
		}

		renderer.render(renderables);
	},

	clear() {
		if(!renderer) {
			throw new Error("Clear scene called before renderer init!");
		}

		renderer.clear();
	},

	isReady() {
		return Boolean(renderer);
	},
};
</script>
<script>
import css from "./screens.mcss";

let { children } = $props();

let canvasEl = $state(false);

$effect(() => {
	if(canvasEl && !renderer) {
		initRenderer(canvasEl);
	}
});
</script>

<div class={css.screenborder}>
	<div class={css.screencontainer}>
		<canvas bind:this={canvasEl} class={css.screen}></canvas>

		<div class={css.screenoverlay}>
			{@render children?.()}
		</div>
	</div>
</div>
