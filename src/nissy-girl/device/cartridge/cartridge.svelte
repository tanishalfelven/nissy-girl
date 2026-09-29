<script>
import css from "./cartridge.mcss";

let { cartridge } = $props();
</script>

<div class={css.cartridgeface}></div>
<div class={css.cartridgefaceartback}>
	<div class={css.cartridgefaceart} data-cartridge={cartridge}></div>
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
