<script>
import { nissyGirl } from "../nissy-girl.viewmodel.svelte.js";
</script>

<div
    class="cartridges"
    style:--x-pos={`${nissyGirl.cartridgeScrollPos}%`}
    data-show="{nissyGirl.displayCartridges}"
>
    <div class="cartridge"></div>
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
    aspect-ratio: 1 / 1;

    height: 90%;

    background-color: gray;
}
</style>
