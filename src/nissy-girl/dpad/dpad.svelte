<script>
import NissyGirlButtonDpadPng from "../assets/dpad.png";
import NissyGirlButtonDpadBackfacePng from "../assets/dpad-backface.png";
import NissyGirlButtonDpadSidePng from "../assets/dpad-side.png";

import { roundHundredths } from "../util/math";

import { rafThrottle } from "../util/throttle";

const MAX_TILT = 4;

let dpadElement = false;

let pressed = false;

const pointerDown = (e) => {
    pressed = true;
};

const pointerMove = (e) => {
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

const pointerExit = (e) => {
    if(!dpadElement) {
        return;
    }

    pressed = false;

    dpadElement.style.setProperty('--rotate-x', '0deg');
    dpadElement.style.setProperty('--rotate-y', '0deg');
}
</script>

<div
    class="dpad"
    on:pointerdown={pointerDown}
    on:pointermove={rafThrottle(pointerMove)}
    on:pointerup={pointerExit}
    on:pointercancel={pointerExit}

    bind:this={dpadElement}

    data-pressed={pressed}
>
    <div class="img dpad-face" style:--image={`url(${NissyGirlButtonDpadPng})`}></div>
    <div class="img dpad-backface" style:--image={`url(${NissyGirlButtonDpadBackfacePng})`}></div>

    <div class="img dpad-center-side" style:--image={`url(${NissyGirlButtonDpadSidePng})`}></div>
    <div class="img dpad-center-side left" style:--image={`url(${NissyGirlButtonDpadSidePng})`}></div>
</div>

<style>
.dpad {
    --rotate-x: 0deg;
    --rotate-y: 0deg;
    --z-plane: calc(var(--depth-w) / 1.8);

    position: absolute;

    display: flex;

    flex-direction: column;

    align-items: center;
    justify-content: center;

    aspect-ratio: 31 / 32;

    height: 14%;

    left: 6.5%;
    bottom: 26.5%;

    transform-style: preserve-3d;
    transform: translateZ(var(--z-plane));
    transform-origin: center center 4px;

    transition: transform 30ms;
}

.dpad-face {
    width: 95%;
    height: 95%;
}

.dpad-backface {
    width: 100%;
    height: 99%;

    margin: auto;

    position: absolute;

    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    transform: translateZ(calc(var(--depth-w) * -0.0175));
}

.dpad[data-pressed="true"] {
    transform: translateZ(var(--z-plane)) rotateX(var(--rotate-x)) rotateY(var(--rotate-y)) scale(0.98);
}

.dpad-center-side {
    aspect-ratio: 9 / 32;

    height: 99%;

    position: absolute;

    top: -0.5%;
    bottom: 0;
    left: 0;
    right: 0;

    transform: rotateY(90deg) translateX(50%) translateZ(calc(var(--round-button-w) * 0.8));

    backface-visibility: visible !important;
    -webkit-backface-visibility: visible !important;
}

.dpad-center-side.left {
    transform: rotateY(90deg) translateX(50%) translateZ(calc(var(--round-button-w) * 0.4));
}
</style>