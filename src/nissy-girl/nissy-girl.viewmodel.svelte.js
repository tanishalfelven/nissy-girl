import {
    roundHundredths,
    wrap,
    clamp,
} from "./util/math";

import { fromCallback } from "xstate";

import {
    MIN_PROGRESS,
    MAX_PROGRESS,
} from "./nissy-girl.consts.js";

import { createProgress } from "./util/progress.svelte.js";

const rotation = createProgress({
    start : 0,
    speed : 1,
    anchors : [ 1 ],
    update : (cur, movement) => wrap(
        cur + movement,
        MIN_PROGRESS,
        MAX_PROGRESS,
    ),
    velocity : {
        smoothing : 0.75,
    }
});

const cartridge = createProgress({
    start : 0,
    speed : -0.9,
    anchors : [ 0.5 ],
    update : (cur, movement) => clamp(
        cur + movement,
        MIN_PROGRESS,
        MAX_PROGRESS,
    ),
    velocity : {
        smoothing : 0.6,
        decay : 0.98,
    }
});

let isPowered = $state(false);
let animDir = $state(0);
let displayCartridges = $state(false);

let hasFinishedCartridgeScroll = $derived(
    cartridge.progress ===
        (animDir === 1 ? MIN_PROGRESS : MAX_PROGRESS)
);

// zoom / rotation play backwards when we return
let effectiveDir = $derived(
    hasFinishedCartridgeScroll ? -animDir : animDir
);

const zoom = createProgress({
    start : 0,
    speed : 1.8,
    update : (cur, movement) =>
        clamp(
            cur + movement * effectiveDir,
            MIN_PROGRESS,
            MAX_PROGRESS,
        ),
    velocity : {
        decay : 0.9,
        smoothing : 0.9,
    },
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

    get effectiveDir() {
        return effectiveDir;
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
