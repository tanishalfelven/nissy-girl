<script>
import { nissyGirlMachine } from "../nissy-girl.machine.js";

</script>

<div
	class="startup-screen"
	on:animationend={() => {
		nissyGirlMachine.send({ type : "BOOT_FINISH" });
	}}
></div>

<style>
@keyframes animateframes {
	0% {
		transform: translateX(0);
	}

	100% {
		transform: translateX(calc(-100% / 16 * 15));
	}
}

.startup-screen {
	aspect-ratio: 2000 / 100;

	margin-top: 1%;
	height: 100%;

	background-image: url("./assets/startup-screen.png");
	background-size: cover;
	background-repeat: no-repeat;
	image-rendering: pixelated;

	animation-name: animateframes;
	animation-delay: 750ms;
	animation-duration: 1100ms;
	animation-direction: normal;
	animation-timing-function: steps(15);
	animation-fill-mode: forwards;
}
</style>
