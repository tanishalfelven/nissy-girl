<script>
import { touch } from "$util/touch-action.svelte.js";
import Cartridges from "$nissy-girl/cartridge/cartridges.svelte";

import FaceControls from "./controls/front-controls.svelte";
import PowerSwitch from "./controls/power-switch/power-switch.svelte";
import VolumeWheel from "./controls/volume/volume-wheel.svelte";
import Screen from "./screens/screen.svelte";
import Prompts from "./prompts/prompts.svelte";

import { nissyGirl } from "./nissy-girl.viewmodel.svelte.js";
import { camera, zoom } from "./camera.viewmodel.svelte.js";
import { lerp, clamp } from "$util/math.js";
import { cameraActor } from "$nissy-girl/nissy-girl.machine.js";

import Cartridge from "./cartridge/cartridge.svelte";

import { cartridges, cartridgeX, cartridgeY } from "./cartridge/cartridge.viewmodel.svelte.js";

import css from "./nissy-girl.mcss";
import cartridgeCss from "./cartridge/cartridge.mcss";

let { children } = $props();

const displayZoom = $derived(zoom.progress * 10);

let nissyGirlWidth = $state(false);

const ROTATION_EDGE_OFFSET = 0.05;
const ROTATION_RANGE = 0.4;

const displayCartridgeRot = $derived.by(() => {
	const rotationProgress = cartridgeX.progress < 0.5
		? clamp(
			(cartridgeX.progress - ROTATION_EDGE_OFFSET) / ROTATION_RANGE,
			0,
			1,
		)
		: clamp(
			(cartridgeX.progress - (1 - ROTATION_EDGE_OFFSET - ROTATION_RANGE))
			/ ROTATION_RANGE,
			0,
			1,
		);

	return cartridgeX.progress < 0.5
		? lerp(rotationProgress, 360, 180)
		: lerp(rotationProgress, 180, 0);
});

let cartridgeHeight = $state(0);
let cartridgeWidth = $state(0);
</script>

<Prompts/>
<Cartridges />

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

		<div
			class={cartridgeCss.cartridge}
			style="--cartridgex: {cartridgeX.progress};
			--cartridgey: {cartridgeY.progress};
			--rotatey: {displayCartridgeRot}deg;"
			data-visibility={cartridges.isVisible}
			bind:clientHeight={cartridgeHeight}
			bind:clientWidth={cartridgeWidth}
			use:touch={{
				start : () => {
					cameraActor.send({
						type : "CART_DRAG_START",
					});

					cameraActor.send({
						type : "CART_XDRAG_START",
					});
				},
				move : (distX, distY) => {
					const deltaX = distX / cartridgeWidth;
					const deltaY = distY / cartridgeHeight;

					const horzAxis = Math.abs(deltaX) > Math.abs(deltaY);

					if(distY !== 0 && cartridgeHeight > 0) {
						cameraActor.send({
							type : "CART_DRAG_DELTA",
							delta : deltaY,
							deltaX,
							bias : !horzAxis,
						});
					}

					if(distX !== 0 && cartridgeWidth > 0) {
						cameraActor.send({
							type : "CART_XDRAG_DELTA",
							delta : deltaX,
							deltaY,
							bias : horzAxis,
						});
					}
				},
				end : () => {
					cameraActor.send({
						type : "CART_DRAG_END",
					});

					cameraActor.send({
						type : "CART_XDRAG_END",
					});
				},
			}}
		>
			<Cartridge cartridge={cartridges.getCurrentCartridgeGame().id} />
		</div>

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
