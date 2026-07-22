<script>
import { rafThrottle } from "../util/throttle";
import { nissyGirl } from "../nissy-girl.viewmodel.svelte.js";

import { nissyGirlMachine } from "../nissy-girl.machine";

let rotateEl;
let rotateElWidth = 0;

let isRotate = false;
let startX = 0;

const startRotate = (e) => {
    isRotate = true;
    startX = e.clientX;

    rotateElWidth = rotateEl.getBoundingClientRect().width;

    document.body.setPointerCapture(e.pointerId);
}

const continuousRotate = rafThrottle((e) => {
    if(!isRotate) {
        return;
    }

    const newX = e.clientX;
    const distX = newX - startX;
    startX = newX;

    const delta = distX / rotateElWidth;

    nissyGirlMachine.send({
        type : "DRAG_DELTA",
        delta,
    });
});

const endRotate = () => {
    if(!isRotate) {
        return;
    }

    isRotate = false;
}
</script>

<svelte:body 
    on:pointerup={endRotate}
    on:pointermove={continuousRotate}
/>

<div
    class="rotatecontainer"
    on:pointerdown={startRotate}
>
    <div
        class="rotate"
        bind:this={rotateEl}
    ></div>
</div>

<style>
.rotatecontainer {
    position: absolute;

    bottom: 0;
    left: 0;
    right: 0;

    height: 25%;
}

.rotate {
    position: absolute;

    bottom: 0;
    left: 0;
    right: 0;

    margin: auto;

    max-width: calc(var(--front-w) + 10rem);

    height: 100%;
}
</style>
