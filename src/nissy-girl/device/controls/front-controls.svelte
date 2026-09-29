<script>
import Dpad from "./dpad/dpad.svelte";
import RoundHousing from "./button/round-housing.svelte";
import Button, { BUTTON_A, BUTTON_B, BUTTON_SELECT, BUTTON_START } from "./button/button.svelte";
</script>

<Button button={BUTTON_SELECT}></Button>
<Button button={BUTTON_START}></Button>

<RoundHousing>
	<Button button={BUTTON_A}></Button>
	<Button button={BUTTON_B}></Button>
</RoundHousing>

<Dpad />
