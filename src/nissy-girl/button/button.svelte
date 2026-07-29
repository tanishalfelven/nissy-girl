<script>
import NissyGirlButtonBPng from "../assets/button-b.png";
import NissyGirlButtonAPng from "../assets/button-a.png";
import NissyGirlButtonRoundSidePng from "../assets/button-round-side.png";

import { controls } from "../util/touch-action.svelte";

const TYPE_BUTTON_A = "a";
const TYPE_BUTTON_B = "b";

let { type = TYPE_BUTTON_A } = $props();

let isPressed = $state(false);
</script>

<div
    use:controls={{
        fire : () => {
            isPressed = true;
        },
        end : () => {
            isPressed = false;
        }
    }}
    class="img button {type}"
    style:--image={`url(${type === TYPE_BUTTON_A ? NissyGirlButtonAPng : NissyGirlButtonBPng})`}
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