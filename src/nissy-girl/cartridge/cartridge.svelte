<script>
import { nissyGirl } from "../nissy-girl.viewmodel.svelte";

import PaintPng from "./assets/paint-art.png";
import CartridgeFace from "./assets/cartridge-face.png";
import CartridgeTop from "./assets/cartridge-top.png";
import CartridgeFaceArtBack from "./assets/cartridge-face-art-back.png";
import CartridgeFaceArtTop from "./assets/cartridge-art-top.png";
import CartridgeFaceArtSide from "./assets/cartridge-art-side.png";
import CartridgeSlatBottom from "./assets/cartridge-slat-bottom.png";
import CartridgeHeader from "./assets/cartridge-header.png";
import CartridgeHeaderOverlay from "./assets/cartridge-header-overlay.png";
import CartridgeBack from "./assets/cartridge-back.png";
import CartridgeSlatTop from "./assets/cartridge-slat-top.png";
import CartridgeSlatUnder from "./assets/cartridge-slat-under.png";
import CartridgeBottom from "./assets/cartridge-bottom.png";
import PcbFace from "./assets/pcb-face.png";
import PcbUnder from "./assets/pcb-under.png";

export let cartridge = PaintPng;

$: console.log(nissyGirl.cartridgeX);
</script>

<div
    class="cartridge"
    style:--x-pos={nissyGirl.cartridgeX}
    style:--rot={nissyGirl.cartridgeRot}
    data-visibility="{nissyGirl.displayCartridges}"
>
    <div class="img cartridgeface" style:--image={`url(${CartridgeFace})`}></div>
    <div class="img cartridgefaceartback" style:--image={`url(${CartridgeFaceArtBack})`}>
        <div class="img cartridgefaceart" style:--image={`url(${cartridge})`}></div>
    </div>

    <div class="img cartridgeheader" style:--image={`url(${CartridgeHeader})`}></div>
    <div class="img cartridgeheaderoverlay" style:--image={`url(${CartridgeHeaderOverlay})`}></div>

    <div class="img cartridgetop" style:--image={`url(${CartridgeTop})`}></div>

    <div class="img cartridgefacearttop" style:--image={`url(${CartridgeFaceArtTop})`}></div>
    <div class="img cartridgefaceartside" style:--image={`url(${CartridgeFaceArtSide})`}></div>
    <div class="img cartridgefaceartside right" style:--image={`url(${CartridgeFaceArtSide})`}></div>

    <div class="img cartridgeface back" style:--image="url({CartridgeBack})"></div>
    <div class="img cartridgebottom" style:--image="url({CartridgeBottom})"></div>

    <div class="img cartridgeslattop" style:--image={`url(${CartridgeSlatTop})`}></div>
    <div class="img cartridgeslattop right" style:--image={`url(${CartridgeSlatTop})`}></div>
    
    <div class="img cartridgeslatbottom" style:--image={`url(${CartridgeSlatBottom})`}></div>
    <div class="img cartridgeslatbottom right" style:--image={`url(${CartridgeSlatBottom})`}></div>
    
    <div class="img cartridgeslatunder" style:--image={`url(${CartridgeSlatUnder})`}></div>
    <div class="img cartridgeslatunder right" style:--image={`url(${CartridgeSlatUnder})`}></div>

    <div class="img pcbface" style:--image={`url(${PcbFace})`}></div>
    <div class="img pcbface back" style:--image="url({PcbFace})"></div>
    <div class="img pcbunder" style:--image="url({PcbUnder})"></div>
</div>

<style>
.cartridge {
    --h: 32vh;
    --front-w: calc(var(--h) * 112 / 105);
    --depth-w: calc(var(--h) * 6 / 105);
    --pcb-y: -9%;

    aspect-ratio: 112 / 105;

    height: var(--h);
    width: var(--front-w);

    transform-style: preserve-3d;

    position: absolute;

    top: 0;
    left: 0;
    right: 0;

    margin: auto;

    transform: translateX(calc(50vw + var(--x-pos))) translateY(-50vh) translateZ(4vw) rotateY(var(--rot)) ;

    transition: transform 80ms linear;
}

.cartridge[data-visibility="false"] {
    opacity: 0;
}

.cartridgeheader {
    aspect-ratio: 106 / 14;

    width: 95%;

    position: absolute;

    top: 2.8%;
    left: 0;
    right: 0;

    margin: auto;

    transform: translateZ(calc(var(--depth-w) * -0.15))
}

.cartridgeheaderoverlay {
    aspect-ratio: 80 / 9;

    width: 72%;

    position: absolute;

    top: 4%;
    left: 0;
    right: 0;

    margin: auto;

    transform: translateZ(calc(var(--depth-w) * -0.099))
}

.cartridgeface {
    aspect-ratio: 112 / 105;

    position: absolute;

    backface-visibility: visible;

    top: 0;
    left: 0;
    right: 0;
}

.cartridgeface.back {
    width: 100%;
    height: 100%;

    transform: rotateY(180deg) translateZ(var(--depth-w));
}

.cartridgefaceartback {
    aspect-ratio: 76 / 73;

    width: 68%;

    position: absolute;

    top: 17%;
    left: 0;
    right: 0;

    margin: auto;

    transform: translateZ(calc(var(--depth-w) * -0.2))
}

.cartridgefaceart {
    aspect-ratio: 74 / 72;

    width: 97%;

    position: absolute;

    bottom: 0;
    left: 0;
    right: 0;

    margin: auto;
}

.cartridgetop {
    aspect-ratio: 112 / 6;

    width: 100%;

    transform: translateZ(calc(var(--depth-w) * -0.5)) rotateY(-90deg) rotateX(-90deg) rotateZ(90deg);
}

.cartridgefacearttop {
    aspect-ratio: 76 / 1;

    width: 68%;

    position: absolute;

    top: 17%;
    left: 0;
    right: 0;

    margin: auto;

    transform: translateZ(calc(var(--depth-w) * -0.06)) rotateY(-90deg) rotateX(-90deg) rotateZ(90deg);
}

.cartridgefaceartside {
    aspect-ratio: 1 / 72;

    width: 0.31vh;

    position: absolute;

    top: 17%;
    left: 16.2%;

    margin: auto;

    transform: translateZ(calc(var(--depth-w) * -0.07)) rotateY(90deg);
}

.cartridgefaceartside.right {
    right: 16.2%;
    left: auto;

    transform: translateZ(calc(var(--depth-w) * -0.07)) rotateY(-90deg);
}

.cartridgeslattop {
    aspect-ratio: 6 / 84;

    width: var(--depth-w);

    position: absolute;

    top: 0;
    left: 0;

    backface-visibility: visible;

    transform: translateZ(calc(var(--depth-w) / -2)) translateX(-50%) rotateY(-90deg) scaleX(1.05);
}

.cartridgeslattop.right {
    left: auto;
    right: 0;

    transform: translateZ(calc(var(--depth-w) * -0.5)) translateX(50%) rotateY(90deg) scaleX(1.05);
}

.cartridgeslatbottom {
    aspect-ratio: 6 / 21;

    width: var(--depth-w);

    position: absolute;

    bottom: 0.12%;
    left: 0;

    backface-visibility: visible;

    transform: translateZ(calc(var(--depth-w) * -0.5)) translateX(90%) rotateY(-90deg) scaleX(1.05);
}

.cartridgeslatbottom.right {
    left: auto;
    right: 0;

    transform: translateZ(calc(var(--depth-w) * -0.5)) translateX(-90%) rotateY(90deg) scaleX(1.05);
}

.cartridgeslatunder {
    aspect-ratio: 9 / 6;

    height: var(--depth-w);

    position: absolute;

    bottom: 17.2%;
    left: -0.05%;

    transform: translateZ(calc(var(--depth-w) * -0.5)) rotateY(-90deg) rotateX(-90deg) rotateZ(90deg) scaleX(1.03);
}

.cartridgeslatunder.right {
    right: -0.05%;
    left: auto;

    transform: translateZ(calc(var(--depth-w) * -0.5)) rotateY(90deg) rotateX(-90deg) rotateZ(90deg) scaleX(1.03);
}

.pcbface {
    aspect-ratio: 88 / 10;

    width: 80%;

    position: absolute;

    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;

    transform: translateY(var(--pcb-y)) translateZ(calc(var(--depth-w) * -.48));
}

.pcbface.back {
    transform: translateY(var(--pcb-y)) rotateY(180deg) translateZ(calc(var(--depth-w) * .53));
}

.pcbunder {
    aspect-ratio: 88 / 1;

    width: 80%;

    position: absolute;

    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;

    transform: translateZ(calc(var(--depth-w) * -.53)) translateY(calc(var(--pcb-y) - 50%)) rotateX(-90deg);
}

.cartridgebottom {
    aspect-ratio: 96 / 6;

    height: var(--depth-w);

    position: absolute;

    bottom: 0;
    left: 0;
    right: 0;;

    margin: auto;

    transform: translateZ(calc(var(--depth-w) * -0.5)) rotateY(-90deg) rotateX(-90deg) rotateZ(90deg) translateZ(0.86vh) scaleY(1.05);
}
</style>
