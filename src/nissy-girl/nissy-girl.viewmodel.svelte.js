import {
    roundHundredths,
    wrap,
    clamp,
} from "./util/math";

import { fromCallback } from "xstate";

import {
    MIN_PROGRESS,
    MAX_PROGRESS,
    CARTRIDGE_THRESHOLD,
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
    anchors : [ CARTRIDGE_THRESHOLD ],
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

const cartridgeY = createProgress({
    start : 0,
    speed : 0.6,
    update : (cur, movement) => clamp(
        cur + movement,
        MIN_PROGRESS,
        MAX_PROGRESS,
    ),
});

let isPowered = $state(false);
let animDir = $state(0);
let displayCartridges = $state(false);
let selectedCartridge = $state(false);
let isReturning = $state(false);

let hasFinishedCartridgeScroll = $derived(
    cartridge.progress ===
        (animDir === 1 ? MIN_PROGRESS : MAX_PROGRESS) ||
    isReturning
);

// zoom / rotation play backwards when we return
let effectiveDir = $derived(
    hasFinishedCartridgeScroll ? -animDir : animDir
);

const zoom = createProgress({
    start : 0,
    speed : 1.8,
    anchors : [ 1 ],
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

    get cartridgeY() {
        return cartridgeY;
    },

    get displayCartridges() {
        return displayCartridges;
    },

    get effectiveDir() {
        return effectiveDir;
    },

    get animDir() {
        return animDir;
    },

    get isReturning() {
        return isReturning;
    },

    get hasFinishedCartridgeScroll() {
        return hasFinishedCartridgeScroll;
    },

    setAnimationDirection(newAnimDir) {
        animDir = newAnimDir;
        isReturning = false;

        if(!selectedCartridge) {
            cartridge.set(newAnimDir < 0 ? MIN_PROGRESS : MAX_PROGRESS);
        }
    },

    clearAnimationDirection() {
        animDir = 0;
    },

    setCartridgeVisible() {
        displayCartridges = true;
    },

    setCartridgeHidden() {
        displayCartridges = false;
        isReturning = false;
    },

    setNotReturning() {
        isReturning = false;
    },

    selectCartridge() {
        selectedCartridge = true;
        isReturning = true;
    },

    deselectCartridge() {
        selectedCartridge = false;
        isReturning = false;
    },

    hasSelectedCartridge() {
        return selectedCartridge;
    },

    togglePower() {
        isPowered = !isPowered;
    },
};
