<script>
import { roundHundredths } from "./util/math.js";

import StartupScreen from "./startup-screen/startup-screen.svelte";

import Cartridge from "./cartridge/cartridge.svelte";
import FaceControls from "./controls/front-controls.svelte";
import PowerSwitch from "./controls/power-switch/power-switch.svelte";

import { nissyGirl } from "./nissy-girl.viewmodel.svelte.js";
import { rotation, zoom } from "./camera.viewmodel.svelte.js";
import { cameraService } from "./statechart-actors.svelte.js";

import { touch } from "./util/touch-action.svelte.js";

const displayRot = $derived(roundHundredths(rotation.progress * 360));
const displayZoom = $derived(roundHundredths(zoom.progress * 10));

let nissyGirlWidth = $state(false);
</script>

<div
	class="camera touch-interactive"
	use:touch={{
		start : () =>
			cameraService.send({
				type : "DRAG_START",
			}),
		move : (distX) =>
			cameraService.send({
				type : "DRAG_DELTA",
				delta : distX / nissyGirlWidth,
			}),
		end : () =>
			cameraService.send({
				type : "DRAG_END",
			}),
	}}
>
	<div
		class="nissygirl"
		bind:clientWidth={nissyGirlWidth}
		style="transform:
			rotateY({displayRot}deg)
				translateZ(calc({displayZoom} * 3vw))
				translateY(calc({displayZoom} * 2.7vh));"
	>

		<div class="face front">
			<div
				class="face mushroom"
				data-power={nissyGirl.isPowered}
			></div>

			<FaceControls />
		</div>

		<Cartridge />
		<PowerSwitch />

		<div class="screen-container">
			<div class="screen">
				{#if nissyGirl.isPowered}
					<StartupScreen />
				{/if}
			</div>
		</div>

		<div class="face screen-bevel-horz"></div>
		<div class="face screen-bevel-vert"></div>
		<div class="face screen-bevel-vert left"></div>
		<div class="face panelside"></div>
		<div class="face panelside left"></div>
		<div class="face backupper"></div>
		<div class="face vent"></div>
		<div class="face backlower"></div>
		<div class="face backloweredge"></div>
		<div class="face backloweredge inner"></div>
		<div class="face cartridgeback"></div>
	</div>
</div>

<style>
:root {
	--h: 65vh;
	--front-w: calc(var(--h) * 142 / 224);
	--depth-w: calc(var(--h) * 46 / 224);
}

.camera {
	position: absolute;

	width: 100%;
	height: 100%;

	perspective: calc(var(--h) * 3);

	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	margin: auto;
}

.nissygirl {
	--rotation: 0;
	--zoom: 1;
	/* 1px of shell definition */
	--1px: calc(var(--h) / 224);
	--button-plane: calc(3 * var(--1px));

	width: var(--front-w);
	height: var(--h);

	position: absolute;

	left: 0;
	right: 0;
	bottom: 8%;

	margin: auto;

	transform-style: preserve-3d;
}

.screen-bevel-vert {
	--rotate: 90deg;
	aspect-ratio: 2 / 100;

	height: 44.8%;

	position: absolute;

	left: 5.6%;
	top: 3%;

	transform: translateZ(calc(var(--depth-w) / 2.09)) rotateY(var(--rotate));

	background-image: url("./assets/screen-bevel-vert.png");
}

.screen-bevel-vert.left {
	--rotate: -90deg;

	left: auto !important;

	right: 4.8%;
}

.screen-bevel-horz {
	aspect-ratio: 125 / 2;

	top: 2.6%;

	left: 50%;

	width: 90%;

	transform: translateX(-50%) translateZ(calc(var(--depth-w) / 2.09)) rotateX(-90deg);

	background-image: url("./assets/screen-bevel-horz.png");
}

.screen-container {
	display: flex;

	flex-direction: row;

	align-items: center;
	justify-content: center;

	width: 100%;
	height: 50%;

	position: absolute;

	will-change: transform;

	background-color: black;

	transform: translateZ(calc(var(--depth-w) / 2.3));
}

.screen {
	aspect-ratio: 5 / 4;

	margin-top: 1%;
	width: 85%;

	overflow: hidden;
}

.mushroom {
	aspect-ratio: 9/9;

	height: 4%;

	position: relative;

	left: 50%;
	top: 50%;

	transform: translate(-75%, -40%);

	will-change: filter;

	background-image: url("./assets/power-shroom.png");

	transition: filter 300ms ease-in-out;
	transition-delay: 150ms;
}

.mushroom[data-power="false"] {
	filter: brightness(0.2);
}

.mushroom[data-power="true"] {
	filter: brightness(1.3);
}

.front {
	aspect-ratio: 142 / 224;

	height: 100%;

	transform: translateZ(calc(var(--depth-w) / 2));

	background-image: url("./assets/nissygirl-front.png");

	transform-style: preserve-3d;
}

.panelside {
	aspect-ratio: 46 / 224;

	height: 100%;

	transform: rotateY(90deg) translateZ(calc(var(--front-w) - var(--depth-w) / 2));

	background-image: url("./assets/nissygirl-side.png");

	backface-visibility: visible !important;
	-webkit-backface-visibility: visible !important;
}

.panelside.left {
	transform: rotateY(-90deg) scaleX(-1) translateZ(calc(var(--depth-w) / 2));
}

.backupper {
	aspect-ratio: 142 / 49;

	top: 0;

	width: 100%;

	transform: rotateY(180deg) translateZ(calc(var(--front-w) * 0.02));

	background-image: url("./assets/nissygirl-back-upper.png");
}

.vent {
	aspect-ratio: 142 / 36;

	top: 2.1%;

	left: 0;
	right: 0;
	margin: auto;

	width: 100%;

	transform: rotateY(180deg) translateZ(calc(var(--front-w) * 0.055));

	background-image: url("./assets/nissygirl-vent-decal.png");
}

.backlower {
	aspect-ratio: 142 / 124;

	width: 100%;

	position: absolute;

	bottom: 0.4%;

	transform: rotateY(180deg) translateY(-4%) translateZ(calc(var(--front-w) / 7.395));

	background-image: url("./assets/nissygirl-back-lower.png");
}

.backloweredge {
	aspect-ratio: 149 / 9;

	width: 100%;

	position: absolute;

	bottom: 1.256%;

	transform: rotateY(180deg) translateZ(calc(var(--front-w) * 0.07));

	background-image: url("./assets/nissy-girl-back-edge.png");
}

.backloweredge.inner {
	bottom: 0.4%;

	transform: rotateY(180deg) translateZ(calc(var(--front-w) * 0.023));
}

.cartridgeback {
	aspect-ratio: 142 / 59;

	width: 100%;

	position: absolute;

	top: 21.5%;

	transform: rotateY(180deg) translateZ(calc(var(--front-w) / 6.2));

	background-image: url("./assets/nissygirl-cartridge-back.png");
}
</style>
