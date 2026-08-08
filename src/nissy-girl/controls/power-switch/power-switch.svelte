<script>
import { nissyGirl } from "$nissy-girl/nissy-girl.viewmodel.svelte.js";
import { touch } from "$util/touch-action.svelte.js";

import { nissyGirlActor } from "$nissy-girl/nissy-girl.machine.js";

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
	class={css.housing}
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
				nissyGirlActor.send({
					type : "POWER_TOGGLE",
				});
			}

			startY = 0;
			candidateY = 0;
		},
	}}
>
	<div
		class={css.powerback}
		data-power={nissyGirl.isPowered}
		data-willtoggle={doesTriggerToggle}
	>
		<div class={css.middle}>
			<div class={css.face}></div>
		</div>

		<div class={css.innerside}></div>
		<div class={css.innersideright}></div>
	</div>
</div>
