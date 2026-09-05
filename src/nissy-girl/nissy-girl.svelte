<script>
import { touch } from "$util/touch-action.svelte.js";
import { roundHundredths } from "$util/math.js";
import Cartridge from "$nissy-girl/cartridge/cartridge.svelte";

import FaceControls from "./controls/front-controls.svelte";
import PowerSwitch from "./controls/power-switch/power-switch.svelte";
import VolumeWheel from "./controls/volume/volume-wheel.svelte";
import Screen from "./screens/screen.svelte";
import Prompts from "./prompts/prompts.svelte";

import { nissyGirl } from "./nissy-girl.viewmodel.svelte.js";
import { camera, zoom } from "./camera.viewmodel.svelte.js";

import { cameraActor } from "./nissy-girl.machine.js";

import css from "./nissy-girl.mcss";

let { children } = $props();

const displayZoom = $derived(roundHundredths(zoom.progress * 10));

let nissyGirlWidth = $state(false);

</script>

<Prompts />

<div
	class={css.camera}
	use:touch={{
		start : () =>
			cameraActor.send({
				type : "DRAG_START",
			}),
		move : (distX, distY) => {
			if(distX === 0 || nissyGirlWidth <= 0) {
				return;
			}

			cameraActor.send({
				type : "DRAG_DELTA",
				// X is our main axis
				delta : distX / nissyGirlWidth,
				// Y is supplementary, some actions ignore it
				deltaY : distY / nissyGirlWidth,
			});
		},
		end : () =>
			cameraActor.send({
				type : "DRAG_END",
			}),
	}}
>
	<div
		class={css.nissygirl}
		bind:clientWidth={nissyGirlWidth}
		style="transform:
			rotateY({camera.displayRotation}deg)
				translateZ(calc({displayZoom} * 12rem))
				translateY(calc({displayZoom} * 12rem));"
	>
		<Screen>
			{@render children?.()}
		</Screen>

		<div class={css.front}>
			<div
				class={css.mushroom}
				data-power={nissyGirl.isPowered}
			></div>

			<FaceControls />

			<div class={css.speakerback}></div>

			<div class={css.screenbevelhorz}></div>
			<div class={css.screenbevelhorz} data-bottom="true"></div>
			<div class={css.screenbevelvert}></div>
			<div class={css.screenbevelvert} data-left="true"></div>
		</div>

		<Cartridge />

		<div class={css.panelside} data-right="true">
			<PowerSwitch />
		</div>

		<div class={css.panelside} data-left="true">
			<VolumeWheel />
		</div>

		<div class={css.backupper}></div>
		<div class={css.vent}></div>
		<div class={css.backlower}></div>
		<div class={css.backloweredge}></div>
		<div class={css.backloweredge} data-inner="true"></div>
		<div class={css.cartridgeback}></div>
	</div>
</div>
