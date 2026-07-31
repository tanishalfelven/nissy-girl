<script>
import PaintPng from "./assets/paint-art.png";

import { roundHundredths, lerp } from "../util/math.js";
import { touch } from "../util/touch-action.svelte.js";

import { nissyGirlMachine } from "../nissy-girl.machine.js";

import { cartridges, cartridgeX, cartridgeY } from "./cartridge.viewmodel.svelte.js";

let{ cartridge = PaintPng } = $props();

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

let cartridgeEl;
let cartridgeHeight = 0;
let lastY = 0;
</script>

<div
	class="cartridge touch-interactive"
	style="transform: translateX(calc(50vw + {displayCartridgeX}vw))
		translateY(calc(-40vh + {displayCartridgeY} * 42vh))
		translateZ(-4.18vh)
		rotateY({displayCartridgeRot}deg);"
	data-visibility="{cartridges.isVisible}"
	bind:this={cartridgeEl}
	use:touch={{
		start : (e) => {
			lastY = e.clientY;

			cartridgeHeight = cartridgeEl.getBoundingClientRect().height;

			nissyGirlMachine.send({
				type : "CART_DRAG_START",
			});
		},
		move : (e) => {
			const newY = e.clientY;
			const distY = newY - lastY;

			lastY = newY;

			nissyGirlMachine.send({
				type : "CART_DRAG_DELTA",
				delta : distY / cartridgeHeight,
			});
		},
		end : () =>
			nissyGirlMachine.send({
				type : "CART_DRAG_END",
			}),
	}}
>
	<div class="face cartridgeface"></div>
	<div class="face cartridgefaceartback">
		<div class="face cartridgefaceart" style:--image={`url(${cartridge})`}></div>
	</div>

	<div class="face cartridgeheader"></div>
	<div class="face cartridgeheaderoverlay"></div>

	<div class="face cartridgetop"></div>

	<div class="face cartridgefacearttop"></div>
	<div class="face cartridgefaceartside"></div>
	<div class="face cartridgefaceartside right"></div>

	<div class="face cartridgeface back"></div>
	<div class="face cartridgebottom"></div>

	<div class="face cartridgeslattop"></div>
	<div class="face cartridgeslattop right"></div>

	<div class="face cartridgeslatbottom"></div>
	<div class="face cartridgeslatbottom right"></div>

	<div class="face cartridgeslatunder"></div>
	<div class="face cartridgeslatunder right"></div>

	<div class="face pcbface"></div>
	<div class="face pcbface back"></div>
	<div class="face pcbunder"></div>
</div>

<style>
.cartridge {
	--h: 32vh;
	--front-w: calc(var(--h) * 112 / 105);
	--depth-w: calc(var(--h) * 6 / 105);
	--pcb-y: -9%;

	aspect-ratio: 112 / 105;

	height: var(--h);
	width: var(--front-w);

	position: absolute;

	top: 0;
	left: 0;
	right: 0;

	margin: auto;

	transform-style: preserve-3d;

	will-change: transform;
}

.cartridge[data-visibility="false"] {
	opacity: 0;
}

.cartridgeheader {
	aspect-ratio: 106 / 14;

	width: 95%;

	position: absolute;

	top: 2.8%;
	left: 0;
	right: 0;

	margin: auto;

	transform: translateZ(calc(var(--depth-w) * -0.15));

	background-image: url("./assets/cartridge-header.png");
}

.cartridgeheaderoverlay {
	aspect-ratio: 80 / 9;

	width: 72%;

	position: absolute;

	top: 4%;
	left: 0;
	right: 0;

	margin: auto;

	transform: translateZ(calc(var(--depth-w) * -0.099));

	background-image: url("./assets/cartridge-header-overlay.png");
}

.cartridgeface {
	aspect-ratio: 112 / 105;

	position: absolute;

	backface-visibility: visible;

	top: 0;
	left: 0;
	right: 0;

	background-image: url("./assets/cartridge-face.png");
}

.cartridgeface.back {
	width: 100%;
	height: 100%;

	transform: rotateY(180deg) translateZ(var(--depth-w));

	background-image: url("./assets/cartridge-back.png");
}

.cartridgefaceartback {
	aspect-ratio: 76 / 73;

	width: 68%;

	position: absolute;

	top: 17%;
	left: 0;
	right: 0;

	margin: auto;

	transform: translateZ(calc(var(--depth-w) * -0.2));

	background-image: url("./assets/cartridge-face-art-back.png");
}

.cartridgefaceart {
	aspect-ratio: 74 / 72;

	width: 97%;

	position: absolute;

	bottom: 0;
	left: 0;
	right: 0;

	background-image: var(--image);

	margin: auto;
}

.cartridgetop {
	aspect-ratio: 112 / 6;

	width: 100%;

	transform: translateZ(calc(var(--depth-w) * -0.5)) rotateY(-90deg) rotateX(-90deg) rotateZ(90deg);

	background-image: url("./assets/cartridge-top.png");
}

.cartridgefacearttop {
	aspect-ratio: 76 / 1;

	width: 68%;

	position: absolute;

	top: 17%;
	left: 0;
	right: 0;

	margin: auto;

	transform: translateZ(calc(var(--depth-w) * -0.06)) rotateY(-90deg) rotateX(-90deg) rotateZ(90deg);

	background-image: url("./assets/cartridge-art-top.png");
}

.cartridgefaceartside {
	aspect-ratio: 1 / 72;

	width: 0.31vh;

	position: absolute;

	top: 17%;
	left: 16.2%;

	margin: auto;

	transform: translateZ(calc(var(--depth-w) * -0.07)) rotateY(90deg);

	background-image: url("./assets/cartridge-art-side.png");
}

.cartridgefaceartside.right {
	right: 16.2%;
	left: auto;

	transform: translateZ(calc(var(--depth-w) * -0.07)) rotateY(-90deg);
}

.cartridgeslattop {
	aspect-ratio: 6 / 84;

	width: var(--depth-w);

	position: absolute;

	top: 0;
	left: 0;

	backface-visibility: visible;

	transform: translateZ(calc(var(--depth-w) / -2)) translateX(-50%) rotateY(-90deg) scaleX(1.05);

	background-image: url("./assets/cartridge-slat-top.png");
}

.cartridgeslattop.right {
	left: auto;
	right: 0;

	transform: translateZ(calc(var(--depth-w) * -0.5)) translateX(50%) rotateY(90deg) scaleX(1.05);
}

.cartridgeslatbottom {
	aspect-ratio: 6 / 21;

	width: var(--depth-w);

	position: absolute;

	bottom: 0.12%;
	left: 0;

	backface-visibility: visible;

	transform: translateZ(calc(var(--depth-w) * -0.5)) translateX(90%) rotateY(-90deg) scaleX(1.05);

	background-image: url("./assets/cartridge-slat-bottom.png");
}

.cartridgeslatbottom.right {
	left: auto;
	right: 0;

	transform: translateZ(calc(var(--depth-w) * -0.5)) translateX(-90%) rotateY(90deg) scaleX(1.05);
}

.cartridgeslatunder {
	aspect-ratio: 9 / 6;

	height: var(--depth-w);

	position: absolute;

	bottom: 17.2%;
	left: -0.05%;

	background-image: url("./assets/cartridge-slat-under.png");

	transform: translateZ(calc(var(--depth-w) * -0.5)) rotateY(-90deg) rotateX(-90deg) rotateZ(90deg) scaleX(1.03);
}

.cartridgeslatunder.right {
	right: -0.05%;
	left: auto;

	transform: translateZ(calc(var(--depth-w) * -0.5)) rotateY(90deg) rotateX(-90deg) rotateZ(90deg) scaleX(1.03);
}

.pcbface {
	aspect-ratio: 88 / 10;

	width: 80%;

	position: absolute;

	left: 0;
	right: 0;
	bottom: 0;

	margin: auto;

	background-image: url("./assets/pcb-face.png");

	transform: translateY(var(--pcb-y)) translateZ(calc(var(--depth-w) * -.48));
}

.pcbface.back {
	transform: translateY(var(--pcb-y)) rotateY(180deg) translateZ(calc(var(--depth-w) * .53));
}

.pcbunder {
	aspect-ratio: 88 / 1;

	width: 80%;

	position: absolute;

	left: 0;
	right: 0;
	bottom: 0;
	margin: auto;

	background-image: url("./assets/pcb-under.png");

	transform: translateZ(calc(var(--depth-w) * -.53)) translateY(calc(var(--pcb-y) - 50%)) rotateX(-90deg);
}

.cartridgebottom {
	aspect-ratio: 96 / 6;

	height: var(--depth-w);

	position: absolute;

	bottom: 0;
	left: 0;
	right: 0;;

	margin: auto;

	background-image: url("./assets/cartridge-bottom.png");

	transform: translateZ(calc(var(--depth-w) * -0.5)) rotateY(-90deg) rotateX(-90deg) rotateZ(90deg) translateZ(0.86vh) scaleY(1.05);
}
</style>
