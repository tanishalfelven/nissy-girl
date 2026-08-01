<script>
import { nissyGirl } from "../../nissy-girl.viewmodel.svelte.js";
import { touch } from "../../util/touch-action.svelte.js";

import { nissyGirlMachine } from "../../nissy-girl.machine.js";

const MIN_CLICK_DIST = 0.02;
const MIN_VERT_DIST = 0.2;

// negative is up, positive is down
const moveDir = $derived(nissyGirl.isPowered ? 1 : -1);

let startY = $state(0);
let candidateY = $state(0);

const inToggleBounds = (percentY) => {
	const absY = Math.abs(percentY);

	return Math.sign(percentY) === moveDir
		&& absY > MIN_VERT_DIST;
};

const doesTriggerToggle = $derived(inToggleBounds(candidateY));

let switchHeight = $state(0);
</script>

<div
	class="face powerswitch top touch-interactive"
	bind:clientHeight={switchHeight}
	use:touch={{
		start : (e) => {
			startY = e.clientY;
		},
		move : (_distX, _distY, e) => {
			candidateY = (e.clientY - startY) / switchHeight;
		},
		end : (e) => {
			const percentY = (e.clientY - startY) / switchHeight;

			if(Math.abs(percentY) < MIN_CLICK_DIST || inToggleBounds(percentY)) {
				nissyGirlMachine.send({
					type : "POWER_TOGGLE",
				});
			}

			startY = 0;
			candidateY = 0;
		},
	}}
	data-power={nissyGirl.isPowered}
	data-willtoggle={doesTriggerToggle}
>
	<div class="face powerswitch left"></div>
	<div class="face powerswitch right"></div>
</div>

<style>
.powerswitch {
	--position: 0%;

	aspect-ratio: 5 / 24;

	position: absolute;

	width: calc(4 * var(--1px));

	background-image: url("./assets/power-switch-side.png");

	padding: calc(3 * var(--1px));
}

.powerswitch.top {
	top: 22%;
	right: -1.5%;

	transform-style: preserve-3d;

	transition: transform 300ms ease-in-out;

	background-image: url("./assets/power-switch-top.png");

	transform:
		translateZ(calc(14.5 * var(--1px)))
		translateY(var(--position))
		rotateY(90deg)
		translateZ(calc(5.5 * var(--1px)))
		translateX(50%);

	background-origin: content-box;
}

.powerswitch[data-willtoggle="true"] {
	--position: 10%;
}

.powerswitch[data-power="false"] {
	--position: 65%;
}

.powerswitch[data-power="false"][data-willtoggle="true"] {
	--position: 55%
}

.powerswitch.left {
	height: calc(13.25 * var(--1px));

	top: calc(3 * var(--1px));
	left: calc(0.6 * var(--1px));

	transform: rotateY(-90deg) translateZ(0.6vh) translateX(-50%);

	backface-visibility: visible;
}

.powerswitch.right {
	height: calc(13.25 * var(--1px));

	top: calc(3 * var(--1px));
	right: calc(0.6 * var(--1px));

	transform: rotateY(90deg) translateZ(0.6vh) translateX(50%);

	backface-visibility: visible;
}
</style>
