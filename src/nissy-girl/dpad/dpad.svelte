<script>
import { roundHundredths, clamp } from "../util/math.js";
import { controls } from "../util/touch-action.svelte.js";

const MAX_TILT = 4;

let dpadElement = false;
let isPressed = $state(false);

let rotateX = $state(0);
let rotateY = $state(0);

const xDeg = $derived(`${roundHundredths(rotateX)}deg`);
const yDeg = $derived(`${roundHundredths(rotateY)}deg`);

const setRotation = (e) => {
    if(!dpadElement) {
        return false;
    }

    isPressed = true;

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

    rotateX = clamp(-normalizedY * MAX_TILT, -MAX_TILT, MAX_TILT);
    rotateY = clamp(normalizedX * MAX_TILT, -MAX_TILT, MAX_TILT);
}

const getTransform = (x, y) => {
    if(!isPressed) {
        return "var(--z-plane))";
    }

    return `translateZ(var(--z-plane)) rotateX(${x}) rotateY(${y}) scale(0.98)`;
};
</script>

<div
    class="dpad"
    use:controls={{
        fire : (e) => setRotation(e),
        end : (e) => {
            isPressed = false;
            rotateX = 0;
            rotateY = 0;
        }
    }}
    bind:this={dpadElement}
    style="transform: {getTransform(xDeg, yDeg)};"
>
    <div class="face dpad-face"></div>
    <div class="face dpad-backface"></div>

    <div class="face dpad-center-side"></div>
    <div class="face dpad-center-side left"></div>
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
    will-change: transform;

    transform: translateZ(var(--z-plane));
    transform-origin: center center 4px;
}

.dpad-face {
    width: 95%;
    height: 95%;

    background-image: url("../assets/dpad.png");
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

    background-image: url("../assets/dpad-backface.png");
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

    background-image: url("../assets/dpad-side.png");

    backface-visibility: visible !important;
    -webkit-backface-visibility: visible !important;
}

.dpad-center-side.left {
    transform: rotateY(90deg) translateX(50%) translateZ(calc(var(--round-button-w) * 0.4));
}
</style>