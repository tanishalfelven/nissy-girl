<script>
import NissyGirlFrontPng from "./assets/nissygirl-front.png";
import NissyGirlSidePng from "./assets/nissygirl-side.png";
import PowerShroomPng from "./assets/power-shroom.png";
import NissyGirlBackUpperPng from "./assets/nissygirl-back-upper.png";
import NissyGirlBackLowerPng from "./assets/nissygirl-back-lower.png";
import NissyGirlScreenBevelHorzPng from "./assets/screen-bevel-horz.png";
import NissyGirlScreenBevelVertPng from "./assets/screen-bevel-vert.png";
import NissyGirlCartridgeBackPng from "./assets/nissygirl-cartridge-back.png";
import NissyGirlButtonBPng from "./assets/button-b.png";
import NissyGirlButtonAPng from "./assets/button-a.png";
import NissyGirlButtonRoundSidePng from "./assets/button-round-side.png";
import NissyGirlPowerSwitchSidePng from "./assets/power-switch-side.png";
import NissyGirlPowerSwitchTopPng from "./assets/power-switch-top.png";

import StartupScreen from "./startup-screen/startup-screen.svelte";

import Dpad from "./dpad/dpad.svelte";

let power = false;
let rotation = 0;

const powerToggle = () => {
    power = !power;
}

const ROTATE_STEP = 45;

const handleRotate = (rotate) => () => {
    rotation += rotate;
}
</script>

<div class="camera">
    <div class="nissygirl" style:--rotation={`${rotation}deg`}>
        <div class="img front" style:--image={`url(${NissyGirlFrontPng})`}>
            <div class="img mushroom" data-power={power} style:--image={`url(${PowerShroomPng})`}></div>
        </div>

        <div class="img screen-bevel-horz" style:--image={`url(${NissyGirlScreenBevelHorzPng})`}></div>
        <div class="img screen-bevel-vert" style:--image={`url(${NissyGirlScreenBevelVertPng})`}></div>
        <div class="img screen-bevel-vert left" style:--image={`url(${NissyGirlScreenBevelVertPng})`}></div>

        <div class="screen">
            {#if power}
                <StartupScreen />
            {/if}
        </div>

        <div class="img button a" style:--image={`url(${NissyGirlButtonAPng})`}>
            <div class="img button-side" style:--image={`url(${NissyGirlButtonRoundSidePng})`}></div>
        </div>

        <div class="img button b" style:--image={`url(${NissyGirlButtonBPng})`}>
            <div class="img button-side" style:--image={`url(${NissyGirlButtonRoundSidePng})`}></div>
        </div>

        <Dpad {rotation} />

        <div on:click={powerToggle} class="img powerswitch powerswitchside" data-power={power} style:--image={`url(${NissyGirlPowerSwitchSidePng})`}></div>
        <div on:click={powerToggle} class="img powerswitch powerswitchside powerswitchsideback" data-power={power} style:--image={`url(${NissyGirlPowerSwitchSidePng})`}></div>
        <div on:click={powerToggle} class="img powerswitch powerswitchtop" data-power={power} style:--image={`url(${NissyGirlPowerSwitchTopPng})`}></div>

        <div class="img panelside" style:--image={`url(${NissyGirlSidePng})`}></div>
        <div class="img panelside left" style:--image={`url(${NissyGirlSidePng})`}></div>
        <div class="img backupper" style:--image={`url(${NissyGirlBackUpperPng})`}></div>
        <div class="img backlower" style:--image={`url(${NissyGirlBackLowerPng})`}></div>
        <div class="img cartridgeback" style:--image={`url(${NissyGirlCartridgeBackPng})`}></div>
    </div>
</div>

<div on:click={handleRotate(ROTATE_STEP)} class="rotate rotateleft"></div>
<div on:click={handleRotate(-ROTATE_STEP)}  class="rotate rotateright"></div>

<style>
@keyframes rotate360 {
    0% {
        transform: rotateY(0deg);
    }

    100% {
        transform: rotateY(360deg);
    }
}

@keyframes rotate45front {
    0% {
        transform: rotateY(-45deg);
    }

    100% {
        transform: rotateY(45deg);
    }
}

@keyframes rotateRightSide {
    0% {
        transform: rotateY(-45deg);
    }

    100% {
        transform: rotateY(-135deg);
    }
}

@keyframes float {
    0% {
        transform: translateY(0%);
    }

    50% {
        transform: translateY(-2.5%);
    }
    

    100% {
        transform: translateY(0%);
    }
}

@keyframes glow {
    0% {
        filter: brightness(1.3);
    }
    
    100% {
        filter: brightness(0.8);
    }
}

@keyframes depress {
    0% {
        transform: translateZ(calc(var(--depth-w) / 1.9));
    }

    50% {
        transform: translateZ(calc(var(--depth-w) / 2));
    }

    100% {
        transform: translateZ(calc(var(--depth-w) / 1.9));
    }
}

.camera {
    --h: 50vh;
    --front-w: calc(var(--h) * 142 / 224);
    --depth-w: calc(var(--h) * 46 / 224);
    --round-button-w: calc(0.082 * var(--h));

    position: absolute;

    width: var(--front-w);
    height: var(--h);

    perspective: calc(var(--h) * 3);

    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;

    animation-name: float;
    animation-iteration-count: infinite;
    animation-timing-function: ease-in-out;
    animation-duration: 3000ms;
    animation-direction: alternate;
}

.rotate {
    position: absolute;

    bottom: 0;

    width: 50%;
    height: 35%;
}

.rotateleft {
    left: 0;
}

.rotateright {
    right: 0;
}

.nissygirl {
    --rotation: 0;

    width: 100%;
    height: 100%;
    position: relative;

    transform-style: preserve-3d;

    transform: rotateY(var(--rotation));

    transition: transform 300ms;
}

.screen-bevel-vert {
    --rotate: 90deg;
    aspect-ratio: 2 / 100;

    height: 44.8%;

    position: absolute;

    left: 5.6%;
    top: 3%;

    transform: translateZ(calc(var(--depth-w) / 2.09)) rotateY(var(--rotate));
}

.screen-bevel-vert.left {
    --rotate: -90deg;

    left: auto !important;

    right: 4.8%;
}

.screen-bevel-horz {
    aspect-ratio: 125 / 2;

    top: 2.6%;

    left: 50%;

    width: 90%;

    transform: translateX(-50%) translateZ(calc(var(--depth-w) / 2.09)) rotateX(-90deg);
}

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

.button {
    position: absolute;

    aspect-ratio: 1 / 1;

    width: var(--round-button-w);

    transform-style: preserve-3d;
}

.button-side {
    aspect-ratio: 1 / 9;

    height: 100%;

    transform: rotateY(90deg) translateX(50%) translateZ(calc(var(--round-button-w) / 2));

    backface-visibility: visible !important;
    -webkit-backface-visibility: visible !important;
}

.button {
    transform: translateZ(calc(var(--depth-w) / 1.8));

    transition: transform 80ms;
}

.button:hover {
    transform: translateZ(calc(var(--depth-w) / 1.94)) scale(0.95);
}

.a {
    right: 9%;
    bottom: 31%;
}

.b {
    right: 26.75%;
    bottom: 26%;
}

.screen {
    display: flex;

    flex-direction: row;

    align-items: center;
    justify-content: center;

    width: 100%;
    height: 50%;

    position: absolute;

    background-color: black;

    transform: translateZ(calc(var(--depth-w) / 2.3));
}

.display {
    aspect-ratio: 5 / 4;

    width: 80%;

    transform: translateY(12%);

    background-color: black;

    transition: background-color 300ms ease-in-out;
    transition-delay: 250ms;
}

.mushroom {
    aspect-ratio: 9/9;

    height: 4%;

    position: relative;

    left: 50%;
    top: 50%;

    transform: translate(-75%, -40%);

    /* animation-name: glow; */
    animation-iteration-count: infinite;
    animation-timing-function: ease-in-out;
    animation-duration: 600ms;
    animation-direction: alternate;

    transition: filter 300ms ease-in-out;
}

.mushroom[data-power="false"] {
    filter: brightness(0.2);
}

.mushroom[data-power="true"] {
    filter: brightness(1.3);
}

.front {
    aspect-ratio: 142 / 224;

    height: 100%;

    transform: translateZ(calc(var(--depth-w) / 2));
}

.panelside {
    aspect-ratio: 46 / 224;

    height: 100%;

    transform: rotateY(90deg) translateZ(calc(var(--front-w) - var(--depth-w) / 2));

    backface-visibility: visible !important;
    -webkit-backface-visibility: visible !important;
}

.panelside.left {
    transform: rotateY(-90deg) scaleX(-1) translateZ(calc(var(--depth-w) / 2));
}

.backupper {
    aspect-ratio: 142 / 49;

    top: 0;

    width: 100%;

    transform: rotateY(180deg) translateZ(calc(var(--front-w) * 0.02));
}

.backlower {
    aspect-ratio: 142 / 124;

    width: 100%;

    position: absolute;

    bottom: 0.4%;

    transform: rotateY(180deg) translateY(-4%) translateZ(calc(var(--front-w) / 7.4));
}

.cartridgeback {
    aspect-ratio: 142 / 59;

    width: 100%;

    position: absolute;

    top: 21.5%;

    transform: rotateY(180deg) translateZ(calc(var(--front-w) / 6.2));
}
</style>
