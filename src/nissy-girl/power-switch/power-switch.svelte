<script>
import NissyGirlPowerSwitchSidePng from "../assets/power-switch-side.png";
import NissyGirlPowerSwitchTopPng from "../assets/power-switch-top.png";

import { nissyGirl } from "../nissy-girl.viewmodel.svelte";
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

    transition: transform 300ms ease-in-out;
}

.powerswitch[data-power="false"] {
    --position: 80%;
}

.powerswitchtop {
    transform: rotateY(90deg) translateZ(calc(var(--front-w) * 1.003)) translateX(-220%) translateY(var(--position));
}

.powerswitchside {
    transform: translateZ(calc(var(--depth-w) * 0.25)) translateY(var(--position));

    right: -2%;
}

.powerswitchsideback {
    transform: translateZ(calc(var(--depth-w) * 0.15)) scaleX(-1) rotateY(180deg) translateY(var(--position));

    right: -2%;
}
</style>