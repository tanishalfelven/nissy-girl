<script>
import { nissyGirl } from "../../nissy-girl.viewmodel.svelte.js";
import { touch } from "../../../util/touch-action.svelte.js";

import { nissyGirlMachine } from "../../nissy-girl.machine.js";

import css from "./power-switch.mcss";

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
	class={css.powerswitch}
	data-top="true"
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
	<div class={css.powerswitch} data-left="true"></div>
	<div class={css.powerswitch} data-right="true"></div>
</div>
