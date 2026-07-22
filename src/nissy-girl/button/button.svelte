<script>
import NissyGirlButtonBPng from "../assets/button-b.png";
import NissyGirlButtonAPng from "../assets/button-a.png";
import NissyGirlButtonRoundSidePng from "../assets/button-round-side.png";

const TYPE_BUTTON_A = "a";
const TYPE_BUTTON_B = "b";

export let type = TYPE_BUTTON_A;

let isPressed = false;
let hitCounter = 0;

const continuePress = (e) => {
    if(isPressed) {
        return;
    }

    if(e.buttons === 1) {
        if(hitCounter >= 3) {
            isPressed = true;
        } else {
            hitCounter++;
        }
    } else {
        hitCounter = 0;
    }
};

const startPress = (e) => {
    isPressed = true;

    e.target.releasePointerCapture(e.pointerId);
};

const stopPress = () => {
    isPressed = false;
};
</script>

<div
    class="img button {type}"
    style:--image={`url(${type === TYPE_BUTTON_A ? NissyGirlButtonAPng : NissyGirlButtonBPng})`}
    on:pointerdown={startPress}
    on:pointermove={continuePress}
    on:pointerup={stopPress}
    on:pointerleave={stopPress}
    data-pressed="{isPressed}"
>
    <div class="img button-side" style:--image={`url(${NissyGirlButtonRoundSidePng})`}></div>
</div>

<style>
.a {
    right: 9%;
    bottom: 31%;
}

.b {
    right: 26.75%;
    bottom: 26%;
}

.button {
    position: absolute;

    aspect-ratio: 1 / 1;

    width: var(--round-button-w);

    transform-style: preserve-3d;
    transform: translateZ(calc(var(--depth-w) / 1.8));

    transition: transform 80ms;
}

.button[data-pressed="true"] {
    transform: translateZ(calc(var(--depth-w) / 1.94)) scale(0.95);
}

.button-side {
    aspect-ratio: 3 / 9;

    height: 100%;

    transform: rotateY(90deg) translateX(50%) translateZ(calc(var(--round-button-w) / 3.2));

    backface-visibility: visible !important;
    -webkit-backface-visibility: visible !important;
}
</style>