<script>
import { lerp } from "$util/math.js";

import Cartridge from "./cartridge.svelte";

import { cartridges, cartridgeX } from "./cartridge.viewmodel.svelte.js";
import { gameOrder } from "$game/games.js";

import cartridgeCss from "./cartridge.mcss";
import cartridgesCss from "./cartridges.mcss";

$effect(() => {
	console.log(cartridges.cartridgeIndex);
});
</script>

<div class={cartridgesCss.cartridges} data-visible={cartridges.isVisible}>
	{#if cartridges.cartridgeIndex > 0 && cartridges.cartridgeIndex < gameOrder.length}
		{#each { length : cartridges.cartridgeIndex } as _, cartridgeIndex}
			{@const isOnFinal = cartridges.cartridgeIndex === gameOrder.length - 1}
			{@const inEnding = cartridgeX.progress >= 0.5}
			{@const x = isOnFinal && inEnding ? 0.2 : -0.3 + cartridgeX.progress}
			{@const backProgress = (cartridgeX.progress - 0.5) / 0.5}
			{@const y = isOnFinal && inEnding ? lerp(1 - backProgress, -0.5, 1) : 1}
			{@const cartridge = gameOrder[cartridgeIndex]}

			{#if cartridge}
				<div
					style="--cartridgex: {x};
					--cartridgey: {y * 1};
					--rotatey: 0deg;"
					class={cartridgeCss.cartridge}
					data-background="true"
					data-cartridge={cartridge}
					data-prev="true"
				>
					<Cartridge cartridge={gameOrder[cartridgeIndex]} />
				</div>
			{/if}
		{/each}
	{/if}

	{#if cartridges.cartridgeIndex < gameOrder.length}
		{#each { length : gameOrder.length - 1 - cartridges.cartridgeIndex } as _, offsetIndex}
			{@const cartridgeIndex = 1 + offsetIndex + cartridges.cartridgeIndex}
			{@const isEntering = cartridges.cartridgeIndex === 0 && cartridgeX.progress <= 0.5}
			{@const startProgress = cartridgeX.progress / 0.5}
			{@const backProgress = (cartridgeX.progress - 0.5) / 0.5}
			{@const x = isEntering ? 0 : backProgress}
			{@const y = isEntering ? lerp(startProgress, -0.5, 1) : 1}
			{@const cartridge = gameOrder[cartridgeIndex]}

			{#if cartridge}
				<div
					style="--cartridgex: {0.7 + x * 0.6};
					--cartridgey: {y * 1};
					--rotatey: 0deg;"
					class={cartridgeCss.cartridge}
					data-background="true"
					data-cartridge={cartridge}
					data-next="true"
				>
					<Cartridge {cartridge} />
				</div>
			{/if}
		{/each}
	{/if}
</div>
