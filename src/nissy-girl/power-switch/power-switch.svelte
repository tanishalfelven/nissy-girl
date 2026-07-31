<script>
import { nissyGirl } from "../nissy-girl.viewmodel.svelte.js";
import { touch } from "../util/touch-action.svelte.js";

const MIN_CLICK_DIST = 0.02;
const MIN_VERT_DIST = 0.2;
const MAX_VERT_DIST = 6;

// negative is up, positive is down
const moveDir = $derived(nissyGirl.isPowered ? 1 : -1);

let startY = $state(0);
let candidateY = $state(0);
let powerEl = false;

const inToggleBounds = (percentY) => {
	const absY = Math.abs(percentY);

	return Math.sign(percentY) === moveDir
		&& absY > MIN_VERT_DIST
		&& absY < MAX_VERT_DIST;
};

const doesTriggerToggle = $derived(inToggleBounds(candidateY));
</script>

<div
	class="face powerswitch parent touch-interactive"
	use:touch={{
		start : (e) => {
			startY = e.clientY;
		},
		move : (e) => {
			if(!powerEl) {
				return;
			}

			const{ height } = powerEl.getBoundingClientRect();

			candidateY = (e.clientY - startY) / height;
		},
		end : (e) => {
			if(!powerEl) {
				return;
			}

			const{ height } = powerEl.getBoundingClientRect();

			const percentY = (e.clientY - startY) / height;

			if(Math.abs(percentY) < MIN_CLICK_DIST || inToggleBounds(percentY)) {
				nissyGirl.togglePower();
			}

			startY = 0;
			candidateY = 0;
		},
	}}
	data-power={nissyGirl.isPowered}
	data-willtoggle={doesTriggerToggle}
	bind:this={powerEl}
>
	<div class="face powerswitch back"></div>
	<div class="face powerswitch top"></div>
</div>

<style>
.powerswitch {
	aspect-ratio: 5 / 24;

	backface-visibility: visible;

	background-image: url("../assets/power-switch-side.png");
}

.powerswitch.parent {
	--width: 0.55vh; /* width of horizontal face pointing out of nissygirl */
	--position: 0%;

	position: absolute;

	top: 23%;
	right: -2%;

	width: 3%;

	transform-style: preserve-3d;

	transition: transform 300ms ease-in-out;

	transform: translateZ(calc(var(--depth-w) * 0.25)) translateY(var(--position));
}

.powerswitch[data-willtoggle="true"] {
	--position: 8%;
}

.powerswitch[data-power="false"] {
	--position: 80%;
}

.powerswitch[data-power="false"][data-willtoggle="true"] {
	--position: 72%
}

.powerswitch.top {
	height: 100%;

	transform: rotateY(90deg) translateZ(0.6vh) translateX(50%);

	background-image: url("../assets/power-switch-top.png");
}

.powerswitch.back {
	height: 100%;

	right: -2%;

	transform: translateZ(calc(var(--depth-w) * -0.095)) scaleX(-1) rotateY(180deg);
}
</style>
