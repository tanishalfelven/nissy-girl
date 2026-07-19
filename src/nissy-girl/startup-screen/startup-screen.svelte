<script>
import StartScreenSpritesPng from "./assets/startup-screen.png";
</script>

<div class="startup-screen" style:--image={`url(${StartScreenSpritesPng})`}></div>

<style>
@property --frame-index {
    syntax: '<number>';
    initial-value: 0;
    inherits: false;
}

@keyframes animateframes {
    0% {
        --frame-index: 0;
    }

    100% {
        --frame-index: 15;
    }
}


.startup-screen {
    --num-frames: 15;
    --frame-index: 0;

    aspect-ratio: 5 / 4;

    margin-top: 1%;
    width: 85%;

    background-image: var(--image);
    background-size: auto 100%;
    background-position: calc(var(--frame-index) / var(--num-frames) * 100%) 50%;
    background-repeat: no-repeat;
    image-rendering: pixelated;

    animation-name: animateframes;
    animation-delay: 750ms;
    animation-duration: 1100ms;
    animation-direction: normal;
    animation-timing-function: steps(var(--num-frames));
    animation-fill-mode: forwards;
}
</style>