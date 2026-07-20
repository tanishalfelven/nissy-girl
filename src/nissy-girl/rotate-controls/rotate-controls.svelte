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
}

const continuousRotate = (e) => {
    if(!isRotate) {
        return;
    }

    const distX = e.clientX - startX;

    rotation += (distX / rotateElWidth) * ROTATE_STEP;

    startX = e.clientX;
}

const endRotate = (e) => {
    if(!isRotate) {
        return;
    }

    isRotate = false;

    const distX = e.clientX - startX;

    if(distX === 0) {
        return;
    }

    rotation += (distX / rotateElWidth) * ROTATE_STEP;
}
</script>

<div
    on:pointermove={rafThrottle(continuousRotate)}
    on:pointerup={endRotate}
    on:pointercancel={endRotate}
    on:pointerleave={endRotate}
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