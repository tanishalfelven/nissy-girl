<script>
import { roundHundredths, lerp } from "$util/math.js";
import { touch } from "$util/touch-action.svelte.js";
import { cameraActor } from "$nissy-girl/nissy-girl.machine.js";

import { cartridges, cartridgeX, cartridgeY } from "./cartridge.viewmodel.svelte.js";

import css from "./cartridge.mcss";

const displayCartridgeRot = $derived(
	roundHundredths(
		((Math.cos(cartridgeX.progress * Math.PI)) / 4) * 720 + 180,
	),
);

const displayCartridgeX = $derived(
	roundHundredths(lerp(-150, 50, cartridgeX.progress)),
);

const displayCartridgeY = $derived(
	roundHundredths(cartridgeY.progress),
);

let cartridgeHeight = $state(0);
let cartridgeWidth = $state(0);

const { cartridge } = $derived(cartridges.getCurrentCartridgeGame());
</script>

<div
	class={css.cartridge}
	style="transform: translateX(calc(50vw + {displayCartridgeX}vw))
		translateY(calc(-40vh + {displayCartridgeY} * 42vh))
			translateZ(-4.18vh)
			rotateY({displayCartridgeRot}deg);"
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
			if(distY !== 0 && cartridgeHeight > 0) {
				cameraActor.send({
					type : "CART_DRAG_DELTA",
					delta : distY / cartridgeHeight,
				});
			}

			if(distX !== 0 && cartridgeWidth > 0) {
				cameraActor.send({
					type : "CART_XDRAG_DELTA",
					delta : distX / cartridgeWidth,
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
	<div class={css.cartridgeface}></div>
	<div class={css.cartridgefaceartback}>
		<div class={css.cartridgefaceart} style:--image={`url(${cartridge})`}></div>
	</div>

	<div class={css.cartridgeheader}></div>
	<div class={css.cartridgeheaderoverlay}></div>

	<div class={css.cartridgetop}></div>

	<div class={css.cartridgefacearttop}></div>
	<div class={css.cartridgefaceartside}></div>
	<div class={css.cartridgefaceartside} data-right="true"></div>

	<div class={css.cartridgeface} data-back="true"></div>
	<div class={css.cartridgebottom}></div>

	<div class={css.cartridgeslattop}></div>
	<div class={css.cartridgeslattop} data-right="true"></div>

	<div class={css.cartridgeslatbottom}></div>
	<div class={css.cartridgeslatbottom} data-right="true"></div>

	<div class={css.cartridgeslatunder}></div>
	<div class={css.cartridgeslatunder} data-right="true"></div>

	<div class={css.pcbface}></div>
	<div class={css.pcbface} data-back="true"></div>
	<div class={css.pcbunder}></div>
</div>
