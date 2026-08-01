<script>
import { nissyGirlMachine } from "../nissy-girl.machine.js";
import css from "./screens.mcss";
</script>

<div
	class={css.startupscreen}
	on:animationend={() => {
		setTimeout(() => {
			nissyGirlMachine.send({ type : "BOOT_FINISH" });
		}, 3000);
	}}
></div>
