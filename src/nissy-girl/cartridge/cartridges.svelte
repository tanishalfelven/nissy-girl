<script>
import { lerp, clamp } from "$util/math.js";
import { touch } from "$util/touch-action.svelte.js";
import { cameraActor } from "$nissy-girl/nissy-girl.machine.js";

import Cartridge from "./cartridge.svelte";

import { cartridges, cartridgeX, cartridgeY } from "./cartridge.viewmodel.svelte.js";
import { gameOrder } from "$game/games.js";

import cartridgeCss from "./cartridge.mcss";
import cartridgesCss from "./cartridges.mcss";

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

				if(distY !== 0 && cartridgeHeight > 0 && !horzAxis) {
					cameraActor.send({
						type : "CART_DRAG_DELTA",
						delta : deltaY,
						deltaX,
					});
				}

				if(distX !== 0 && cartridgeWidth > 0 && horzAxis) {
					cameraActor.send({
						type : "CART_XDRAG_DELTA",
						delta : deltaX,
						deltaY,
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

	{#if cartridges.cartridgeIndex > 0}
		<div class={cartridgesCss.cartridges} data-prev="true">
			{#each { length : cartridges.cartridgeIndex } as _, cartridgeIndex}
				{@const isOnFinal = cartridges.cartridgeIndex === gameOrder.length - 1}
				{@const inEnding = cartridgeX.progress >= 0.5}
				{@const x = isOnFinal && inEnding ? 0.3 : -0.2 + cartridgeX.progress}
				{@const backProgress = (cartridgeX.progress - 0.5) / 0.5}
				{@const y = isOnFinal && inEnding ? lerp(1 - backProgress, -0.5, 1) : 1}

				<div
					style="--cartridgex: {x};
					--cartridgey: {y * 1};
					--rotatey: 0deg;"
					class={cartridgeCss.cartridge}
					data-background="true"
				>
					<Cartridge cartridge={gameOrder[cartridgeIndex]} />
				</div>
			{/each}
		</div>
	{/if}

	{#if cartridges.cartridgeIndex < gameOrder.length - 1}
		<div class={cartridgesCss.cartridges} data-next="true">
			{#each { length : gameOrder.length - 1 - cartridges.cartridgeIndex } as _, offsetIndex}
				{@const cartridgeIndex = 1 + offsetIndex + cartridges.cartridgeIndex}
				{@const isEntering = cartridges.cartridgeIndex === 0 && cartridgeX.progress <= 0.5}
				{@const startProgress = cartridgeX.progress / 0.5}
				{@const backProgress = (cartridgeX.progress - 0.5) / 0.5}
				{@const x = isEntering ? 0 : backProgress}
				{@const y = isEntering ? lerp(startProgress, -0.5, 1) : 1}

				<div
					style="--cartridgex: {0.7 + x * 0.4};
					--cartridgey: {y * 1};
					--rotatey: 0deg;"
					class={cartridgeCss.cartridge}
					data-background="true"
				>
					<Cartridge cartridge={gameOrder[cartridgeIndex]} />
				</div>
			{/each}
		</div>
	{/if}
{/if}
