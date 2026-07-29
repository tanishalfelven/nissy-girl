<script>
import NissyGirlPowerSwitchSidePng from "../assets/power-switch-side.png";
import NissyGirlPowerSwitchTopPng from "../assets/power-switch-top.png";

import { nissyGirl } from "../nissy-girl.viewmodel.svelte.js";
</script>

<div
    on:click={nissyGirl.togglePower}
    class="img powerswitch powerswitchside"
    data-power={nissyGirl.isPowered}
    style:--image={`url(${NissyGirlPowerSwitchSidePng})`}
>
</div>

<div
    on:click={nissyGirl.togglePower}
    class="img powerswitch powerswitchside powerswitchsideback"
    data-power={nissyGirl.isPowered}
    style:--image={`url(${NissyGirlPowerSwitchSidePng})`}
>
</div>

<div
    on:click={nissyGirl.togglePower}
    class="img powerswitch powerswitchtop"
    data-power={nissyGirl.isPowered}
    style:--image={`url(${NissyGirlPowerSwitchTopPng})`}
>
</div>

<style>
.powerswitch {
    --position: 0%;

    aspect-ratio: 5 / 24;

    position: absolute;

    top: 23%;

    width: 3%;
}

.powerswitch[data-power="false"] {
    --position: 80%;
}

.powerswitchtop {
    transform: rotateY(calc(90deg * var(--3d))) translateZ(calc(var(--front-w) * 1.003 * var(--3d))) translateX(calc(-220% * var(--3d))) translateY(calc(var(--position) * var(--3d))) scale(var(--scale));
}

.powerswitchside {
    transform: translateZ(calc(var(--depth-w) * 0.25 * var(--3d))) translateY(calc(var(--position) * var(--3d))) scale(var(--scale));

    right: -2%;
}

.powerswitchsideback {
    transform: translateZ(calc(var(--depth-w) * 0.15 * var(--3d))) scaleX(calc(-1 * var(--3d))) rotateY(calc(180deg * var(--3d))) translateY(calc(var(--position) * var(--3d))) scale(var(--scale));

    right: -2%;
}
</style>