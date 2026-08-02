<script>
import { touch } from "$util/touch-action.svelte.js";
import { statechart } from "$util/statechart-actors.svelte.js";
import { roundHundredths } from "$util/math.js";
import Cartridge from "$nissy-girl/cartridge/cartridge.svelte";

import FaceControls from "./controls/front-controls.svelte";
import PowerSwitch from "./controls/power-switch/power-switch.svelte";
import Screen from "./screens/screen.svelte";

import { nissyGirl } from "./nissy-girl.viewmodel.svelte.js";
import { rotation, zoom } from "./camera.viewmodel.svelte.js";

import css from "./nissy-girl.mcss";

const displayRot = $derived(roundHundredths(rotation.progress * 360));
const displayZoom = $derived(roundHundredths(zoom.progress * 10));

let nissyGirlWidth = $state(false);

let { children } = $props();
</script>

<div
	class={css.camera}
	use:touch={{
		start : () =>
			statechart.send({
				type : "DRAG_START",
			}),
		move : (distX) => {
			if(distX === 0 || nissyGirlWidth <= 0) {
				return;
			}

			statechart.send({
				type : "DRAG_DELTA",
				delta : distX / nissyGirlWidth,
			});
		},
		end : () =>
			statechart.send({
				type : "DRAG_END",
			}),
	}}
>
	<div
		class={css.nissygirl}
		bind:clientWidth={nissyGirlWidth}
		style="transform:
			rotateY({displayRot}deg)
				translateZ(calc({displayZoom} * 3vw))
				translateY(calc({displayZoom} * 2.7vh));"
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
		</div>

		<Cartridge />

		<div class={css.panelside} data-right="true">
			<PowerSwitch />
		</div>

		<div class={css.screenbevelhorz}></div>
		<div class={css.screenbevelvert}></div>
		<div class={css.screenbevelvert} data-left="true"></div>
		<div class={css.panelside} data-left="true"></div>
		<div class={css.backupper}></div>
		<div class={css.vent}></div>
		<div class={css.backlower}></div>
		<div class={css.backloweredge}></div>
		<div class={css.backloweredge} data-inner="true"></div>
		<div class={css.cartridgeback}></div>
	</div>
</div>
