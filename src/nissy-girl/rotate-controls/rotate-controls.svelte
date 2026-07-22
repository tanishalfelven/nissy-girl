<script>
import { rafThrottle } from "../util/throttle";

const ROTATE_STEP = 280;

export let rotation = false;

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

    rotation += (distX / rotateElWidth) * ROTATE_STEP;

    startX = newX;
});

const endRotate = (e) => {
    if(!isRotate) {
        return;
    }

    isRotate = false;

    const distX = e.clientX - startX;

    if(distX === 0) {
        return;
    }
}
</script>

<svelte:body 
    on:pointerup={endRotate}
    on:pointermove={continuousRotate}
/>

<div
    class="rotatecontainer"
>
    <div
        on:pointerdown={startRotate}
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