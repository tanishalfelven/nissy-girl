<script>
import { onMount } from "svelte";

import NissyGirlFrontPng from "./assets/nissygirl-front.png";
import NissyGirlSidePng from "./assets/nissygirl-side.png";
import PowerShroomPng from "./assets/power-shroom.png";
import NissyGirlBackUpperPng from "./assets/nissygirl-back-upper.png";
import NissyGirlBackVentPng from "./assets/nissygirl-vent-decal.png";
import NissyGirlBackLowerPng from "./assets/nissygirl-back-lower.png";
import NissyGirlBackEdgePng from "./assets/nissy-girl-back-edge.png";
import NissyGirlScreenBevelHorzPng from "./assets/screen-bevel-horz.png";
import NissyGirlScreenBevelVertPng from "./assets/screen-bevel-vert.png";
import NissyGirlCartridgeBackPng from "./assets/nissygirl-cartridge-back.png";

import StartupScreen from "./startup-screen/startup-screen.svelte";
import PowerSwitch from "./power-switch/power-switch.svelte";

import RotateControls from "./rotate-controls/rotate-controls.svelte";

import Dpad from "./dpad/dpad.svelte";
import Button from "./button/button.svelte";

import Cartridges from "./cartridges/cartridges.svelte";

import { nissyGirl } from "./nissy-girl.viewmodel.svelte.js";
import { nissyGirlMachine } from "./nissy-girl.machine";

onMount(() => {
    nissyGirlMachine.start();
})
</script>

<div class="camera">
    <Cartridges />

    <div
        class="nissygirl"
        style:--rotation={`${nissyGirl.rotation}deg`}
        style:--zoom={`${nissyGirl.zoom}`}
    >
        <div class="img front" style:--image={`url(${NissyGirlFrontPng})`}>
            <div 
                class="img mushroom" 
                data-power={nissyGirl.isPowered} 
                style:--image={`url(${PowerShroomPng})`}
            ></div>
        </div>

        <div class="img screen-bevel-horz" style:--image={`url(${NissyGirlScreenBevelHorzPng})`}></div>
        <div class="img screen-bevel-vert" style:--image={`url(${NissyGirlScreenBevelVertPng})`}></div>
        <div class="img screen-bevel-vert left" style:--image={`url(${NissyGirlScreenBevelVertPng})`}></div>

        <div class="screen">
            {#if nissyGirl.isPowered}
                <StartupScreen />
            {/if}
        </div>

        <PowerSwitch />

        <Button type="a"></Button>
        <Button type="b"></Button>

        <Dpad />

        <div class="img panelside" style:--image={`url(${NissyGirlSidePng})`}></div>
        <div class="img panelside left" style:--image={`url(${NissyGirlSidePng})`}></div>
        <div class="img backupper" style:--image={`url(${NissyGirlBackUpperPng})`}></div>
        <div class="img vent" style:--image={`url(${NissyGirlBackVentPng})`}></div>
        <div class="img backlower" style:--image={`url(${NissyGirlBackLowerPng})`}></div>
        <div class="img backloweredge" style:--image={`url(${NissyGirlBackEdgePng})`}></div>
        <div class="img backloweredgeinner" style:--image={`url(${NissyGirlBackEdgePng})`}></div>
        <div class="img cartridgeback" style:--image={`url(${NissyGirlCartridgeBackPng})`}></div>
    </div>
</div>

<RotateControls />

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

@keyframes animateframes {
    0% {
        --frame-index: 0;
    }

    100% {
        --frame-index: 15;
    }
}

:root {
    --h: 65vh;
    --front-w: calc(var(--h) * 142 / 224);
    --depth-w: calc(var(--h) * 46 / 224);
    --round-button-w: calc(0.082 * var(--h));
}

.camera {
    position: absolute;

    width: 100%;
    height: 100%;

    perspective: calc(var(--h) * 3);

    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
}

.nissygirl {
    --rotation: 0;
    --zoom: 1;

    width: var(--front-w);
    height: var(--h);

    position: absolute;

    left: 0;
    right: 0;
    top: 0;
    bottom: 0;

    margin: auto;

    transform-style: preserve-3d;

    transform: rotateY(var(--rotation)) translateZ(calc(var(--zoom) * 3vw)) translateY(calc(var(--zoom) * 2.7vh));
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

.vent {
    aspect-ratio: 142 / 36;

    top: 2.1%;

    left: 0;
    right: 0;
    margin: auto;

    width: 100%;

    transform: rotateY(180deg) translateZ(calc(var(--front-w) * 0.055));
}

.backlower {
    aspect-ratio: 142 / 124;

    width: 100%;

    position: absolute;

    bottom: 0.4%;

    transform: rotateY(180deg) translateY(-4%) translateZ(calc(var(--front-w) / 7.395));
}

.backloweredge {
    aspect-ratio: 149 / 9;

    width: 100%;

    position: absolute;

    bottom: 1.256%;

    transform: rotateY(180deg) translateZ(calc(var(--front-w) * 0.07));
}

.backloweredgeinner {
    aspect-ratio: 149 / 9;

    width: 100%;

    position: absolute;

    bottom: 0.4%;

    transform: rotateY(180deg) translateZ(calc(var(--front-w) * 0.023));
}

.cartridgeback {
    aspect-ratio: 142 / 59;

    width: 100%;

    position: absolute;

    top: 21.5%;

    transform: rotateY(180deg) translateZ(calc(var(--front-w) / 6.2));
}
</style>
