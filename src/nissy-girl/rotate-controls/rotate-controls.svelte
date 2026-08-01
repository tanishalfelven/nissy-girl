<script>
	import { cameraService } from "../statechart-actors.svelte.js";

	import { touch } from "../util/touch-action.svelte.js";

	let rotateEl;
	let rotateElWidth = 0;
	let lastX = 0;
</script>

<div
	class="rotatecontainer touch-interactive"
	use:touch={{
		start : (e) => {
			lastX = e.clientX;

			rotateElWidth = rotateEl.getBoundingClientRect().width;

			cameraService.send({
				type : "DRAG_START",
			});
		},
		move : (e) => {
			const newX = e.clientX;
			const distX = newX - lastX;

			lastX = newX;

			cameraService.send({
				type : "DRAG_DELTA",
				delta : distX / rotateElWidth,
			});
		},
		end : () =>
			cameraService.send({
				type : "DRAG_END",
			}),
	}}
>
	<div
		class="rotate"
		bind:this={rotateEl}
	></div>
</div>

<style>
.rotatecontainer {
	position: absolute;

	height: 25%;

	bottom: 0;
	left: 0;
	right: 0;
}

.rotate {
	position: absolute;

	bottom: 0;
	left: 0;
	right: 0;

	margin: auto;

	max-width: calc(var(--front-w) + 10rem);

	height: 100%;
}
</style>
