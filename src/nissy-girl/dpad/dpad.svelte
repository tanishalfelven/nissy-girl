<script>
import NissyGirlButtonDpadPng from "../assets/dpad.png";
import NissyGirlButtonDpadSidePng from "../assets/dpad-side.png";

import { roundHundredths } from "../util/math";

const MAX_TILT = 4;

export let rotation = 0;

let dpadElement = false;

const mousemove = (e) => {
    if(!dpadElement) {
        return false;
    }

    const {
        left : dpadLeft,
        top : dpadTop,
        width : dpadWidth,
        height : dpadHeight,
    } = dpadElement.getBoundingClientRect();

    const normalizedX =
      ((e.clientX - dpadLeft) / dpadWidth) * 2 - 1;

    const normalizedY =
      ((e.clientY - dpadTop) / dpadHeight) * 2 - 1;

    const rotateX = -normalizedY * MAX_TILT;
    const rotateY = normalizedX * MAX_TILT;

    dpadElement.style.setProperty('--rotate-x', `${roundHundredths(rotateX)}deg`);
    dpadElement.style.setProperty('--rotate-y', `${roundHundredths(rotateY)}deg`);
}

const mouseleave = (e) => {
    if(!dpadElement) {
        return;
    }

    dpadElement.style.setProperty('--rotate-x', '0deg');
    dpadElement.style.setProperty('--rotate-y', '0deg');
}
</script>

<div
    class="img dpad"
    style:--image={`url(${NissyGirlButtonDpadPng})`}
    on:mousemove={mousemove}
    on:mouseleave={mouseleave}
    bind:this={dpadElement}
>
    <div class="img dpad-center-side" style:--image={`url(${NissyGirlButtonDpadSidePng})`}></div>
</div>

<style>
.dpad {
    --rotate-x: 0deg;
    --rotate-y: 0deg;
    --z-plane: calc(var(--depth-w) / 1.8);

    position: absolute;

    aspect-ratio: 31 / 32;

    height: 14%;

    left: 6.5%;
    bottom: 26.5%;

    transform-style: preserve-3d;
    transform: translateZ(var(--z-plane));
    transform-origin: center center 4px;

    transition: transform 80ms;
}

.dpad:hover {
    transform: translateZ(var(--z-plane)) rotateX(var(--rotate-x)) rotateY(var(--rotate-y)) scale(0.98);
}

.dpad-center-side {
    aspect-ratio: 3 / 32;

    height: 100%;

    transform: rotateY(90deg) translateX(50%) translateZ(calc(var(--round-button-w) * 0.8));

    backface-visibility: visible !important;
    -webkit-backface-visibility: visible !important;
}
</style>