<script>
import { nissyGirl } from "../nissy-girl.viewmodel.svelte.js";

import PaintPng from "./assets/paint.png";
</script>

<div
    class="cartridges"
    style:--x-pos={`${nissyGirl.cartridgeScrollPos}%`}
    data-show="{nissyGirl.displayCartridges}"
>
    <div class="img cartridge" style:--image={`url(${PaintPng})`}></div>
</div>

<style>
.cartridges {
    position: absolute;

    top: 5vh;

    width: 100%;
    
    height: 30vh;

    opacity: 0;

    transform: translateX(var(--x-pos));

    display: flex;
    flex-direction: row;

    align-items: center;
}

.cartridges[data-show="true"] {
    opacity: 1;
}

.cartridge {
    aspect-ratio: 112 / 105;

    height: 100%;
}
</style>
