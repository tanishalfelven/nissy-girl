import {
    roundHundredths,
    wrap,
    clamp,
} from "./util/math";

import { fromCallback } from "xstate";

import {
    MIN_PROGRESS,
    MAX_PROGRESS,
    ROTATE_SPEED,
    CARTRIDGE_SPEED,
    ZOOM_SPEED,
} from "./nissy-girl.consts.js";

import { createProgress } from "./util/progress.svelte.js";

const rotation = createProgress({
    start : 0,
    update : (cur, delta) => wrap(
        cur + delta * ROTATE_SPEED,
        MIN_PROGRESS,
        MAX_PROGRESS,
    ),
});

const cartridge = createProgress({
    start : 0,
    update : (cur, delta) => clamp(
        cur + delta * CARTRIDGE_SPEED,
        MIN_PROGRESS,
        MAX_PROGRESS,
    ),
});

let isPowered = $state(false);
let animDir = $state(0);
let displayCartridges = $state(false);

let hasFinishedCartridgeScroll = $derived(
    cartridge.progress ===
        (animDir === 1 ? MIN_PROGRESS : MAX_PROGRESS)
);

let zoomDir = $derived(
    hasFinishedCartridgeScroll ? -animDir : animDir
);

const zoom = createProgress({
    start : 0,
    update : (cur, delta) => !console.log({
        cur, delta, zoomDir, hasFinishedCartridgeScroll,
        cartProg : cartridge.progress
    }) && clamp(
        roundHundredths(cur + delta * ZOOM_SPEED * zoomDir),
        MIN_PROGRESS,
        MAX_PROGRESS,
    )
});

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

    get cartridge() {
        return cartridge;
    },

    get displayCartridges() {
        return displayCartridges;
    },

    get animDir() {
        return animDir;
    },

    get zoomDir() {
        return zoomDir;
    },

    setAnimationDirection(newAnimDir) {
        animDir = newAnimDir;

        cartridge.set(newAnimDir < 0 ? MIN_PROGRESS : MAX_PROGRESS);
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

    togglePower() {
        isPowered = !isPowered;
    },
};
