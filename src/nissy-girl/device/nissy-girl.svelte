<script>
import { noopFalseFunction } from "$util/noop.js";
import { touch, handleEvent } from "$util/touch-action.svelte.js";
import { lerp, clamp } from "$util/math.js";

import FaceControls from "./controls/front-controls.svelte";
import PowerSwitch from "./controls/power-switch/power-switch.svelte";
import VolumeWheel from "./controls/volume/volume-wheel.svelte";
import Screen from "./screens/screen.svelte";

import { nissyGirl } from "./nissy-girl.viewmodel.svelte.js";
import { zoom, camera } from "./device-camera.viewmodel.svelte.js";
import { cartridges, cartridgeX, cartridgeY } from "./cartridge/cartridge.viewmodel.svelte.js";

import { gestureActor } from "$nissy-girl/gesture.machine.js";
import { gesture } from "$nissy-girl/gesture.viewmodel.svelte.js";

import Cartridge from "./cartridge/cartridge.svelte";

import css from "./nissy-girl.mcss";
import cartridgeCss from "./cartridge/cartridge.mcss";

let { children, nissyGirlWidth = $bindable(false) } = $props();

const displayZoom = $derived(zoom.progress * 10);

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

const displaySides = $derived(gesture.isDeviceFocused || gesture.shouldAnimate);
</script>

<div
	class={css.nissygirl}
	bind:clientWidth={nissyGirlWidth}
	style="--rotation: {camera.displayRotation}deg;
	--translatez: {displayZoom * 12}rem;
	--translatey: {displayZoom * 12}rem;"
	data-background={!gesture.isDeviceFocused}
	data-animate={gesture.shouldAnimate}
	use:touch={{
		start : () => {
			if(!gesture.isDeviceFocused) {
				gestureActor.send({ type : "FOCUS_DEVICE" });

				return;
			}
		},
		move : noopFalseFunction,
		end : noopFalseFunction,
		handleEvent : (e) => {
			if(!gesture.isDeviceFocused) {
				handleEvent(e);
			}
		},
	}}
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

		<div class={css.speakeroverlay}></div>
		<div class={css.speakermushroom}></div>
		<div class={css.speakergrill}></div>
		<div class={css.speakerback}></div>

		<div class={css.screenbevelhorz}></div>
		<div class={css.screenbevelhorz} data-bottom="true"></div>
		<div class={css.screenbevelvert}></div>
		<div class={css.screenbevelvert} data-left="true"></div>
	</div>

	{#if cartridges.isVisible}
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
				gestureActor.send({
					type : "CART_DRAG_START",
				});

				gestureActor.send({
					type : "CART_XDRAG_START",
				});
			},
			move : (distX, distY) => {
				const deltaX = distX / cartridgeWidth;
				const deltaY = distY / cartridgeHeight;
				const horzAxis = Math.abs(deltaX) > Math.abs(deltaY);

				if(distY !== 0 && cartridgeHeight > 0) {
					gestureActor.send({
						type : "CART_DRAG_DELTA",
						delta : deltaY,
						deltaX,
						bias : !horzAxis,
					});
				}

				if(distX !== 0 && cartridgeWidth > 0) {
					gestureActor.send({
						type : "CART_XDRAG_DELTA",
						delta : deltaX,
						deltaY,
						bias : horzAxis,
					});
				}
			},
			end : () => {
				gestureActor.send({
					type : "CART_DRAG_END",
				});

				gestureActor.send({
					type : "CART_XDRAG_END",
				});
			},
		}}
	>
		<Cartridge cartridge={cartridges.getCurrentCartridgeId()} />
	</div>
	{/if}

	<div class={css.panelside} data-right="true" data-display={displaySides}>
		<PowerSwitch />
	</div>

	<div class={css.panelside} data-left="true" data-display={displaySides}>
		<VolumeWheel />
	</div>

	<div class={css.top}></div>
	<div class={css.backupper}></div>
	<div class={css.vent}></div>
	<div class={css.backlower}></div>
	<div class={css.backloweredge}></div>
	<div class={css.backloweredge} data-inner="true"></div>
	<div class={css.cartridgeback}></div>
</div>
