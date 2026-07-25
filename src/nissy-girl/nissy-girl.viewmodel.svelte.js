import {
    roundHundredths,
    wrap,
    clamp,
    lerp,
} from "./util/math";

import { fromCallback } from "xstate";

import {
    MIN_ZOOM,
    MAX_ZOOM,
    MIN_PROGRESS,
    MAX_PROGRESS,
} from "./nissy-girl.consts.js";

let rotation = $state(0);
let isPowered = $state(false);
let zoom = $state(MIN_ZOOM);
let animDir = $state(0);
let cartridgeProgress = $state(0);
let displayCartridges = $state(false);
let hasFinishedCartridgeScroll = $derived(
    cartridgeProgress ===
        (animDir === 1 ? MIN_PROGRESS : MAX_PROGRESS)
);
let zoomDir = $derived(
    hasFinishedCartridgeScroll ? -animDir : animDir
);

let cartridgeX = $derived(
    `${roundHundredths(lerp(-150, 50, cartridgeProgress))}vw`
);

let cartridgeRot = $derived(
    `${roundHundredths(
        ((Math.cos(cartridgeProgress * Math.PI)) / 4) * 720 + 180
    )}deg`
);

export const nissyGirl = {
    get rotation() {
        return rotation;
    },

    get isPowered() {
        return isPowered;
    },

    get zoom() {
        return zoom;
    },

    get cartridgeProgress() {
        return cartridgeProgress;
    },

    get displayCartridges() {
        return displayCartridges;
    },

    get animDir() {
        return animDir;
    },

    get hasFinishedCartridgeScroll() {
        return hasFinishedCartridgeScroll;
    },

    get cartridgeX() {
        return cartridgeX;
    },

    get cartridgeRot() {
        return cartridgeRot;
    },

    get zoomDir() {
        return zoomDir;
    },

    setAnimationDirection(newAnimDir) {
        animDir = newAnimDir;

        cartridgeProgress = newAnimDir < 0 ? MIN_PROGRESS : MAX_PROGRESS;
    },

    clearAnimationDirection() {
        animDir = 0;
    },

    invokeDisplayCartridges() {
        return ({
            id : "display-cartridges",
            src : fromCallback(() => {
                displayCartridges = true;

                return () => {
                    displayCartridges = false;
                }
            })
        })
    },

    addCartridgeProgress(delta) {
        cartridgeProgress = clamp(
            cartridgeProgress + delta,
            MIN_PROGRESS,
            MAX_PROGRESS,
        );
    },

    addZoom(zoomDelta) {
        zoom = clamp(
            roundHundredths(zoom + zoomDelta),
            MIN_ZOOM,
            MAX_ZOOM,
        );
    },

    addRotation(rotDelta) {
        rotation = wrap(
            roundHundredths(rotation + rotDelta),
            0,
            360
        );
    },

    setRotation(newRot) {
        rotation = newRot;
    },

    togglePower() {
        isPowered = !isPowered;
    },
};
