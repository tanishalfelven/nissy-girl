import {
    roundHundredths,
    wrap,
    clamp,
} from "./util/math";

import { fromCallback } from "xstate";

import {
    MIN_PROGRESS,
    MAX_PROGRESS,
    CARTRIDGE_SELECTION_THRESHOLD,
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

const cartridgeX = createProgress({
    start : 0,
    speed : -0.9,
    anchors : [ CARTRIDGE_SELECTION_THRESHOLD ],
    update : (cur, movement) => clamp(
        cur + movement,
        MIN_PROGRESS,
        MAX_PROGRESS,
    ),
    velocity : {
        smoothing : 0.6,
        decay : 0.92,
    }
});

const cartridgeY = createProgress({
    start : 0,
    speed : 0.7,
    anchors : [ 0, 1 ],
    update : (cur, movement) =>
        clamp(
            cur + movement,
            MIN_PROGRESS,
            MAX_PROGRESS,
        ),
    velocity : {
        smoothing : 0.7,
        decay : 0.9,
        min : 0.0001,
    }
});

let isPowered = $state(false);
let displayCartridges = $state(false);
let selectedCartridge = $state(false);
let hasFinishedCartridgeScroll = $state(false);

const zoom = createProgress({
    start : 0,
    speed : 1.8,
    anchors : [ 1 ],
    update : (cur, movement) =>
        clamp(
            cur + Math.abs(movement) * (hasFinishedCartridgeScroll ? -1 : 1),
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

    get cartridgeX() {
        return cartridgeX;
    },

    get cartridgeY() {
        return cartridgeY;
    },

    get displayCartridges() {
        return displayCartridges;
    },

    get hasFinishedCartridgeScroll() {
        return hasFinishedCartridgeScroll;
    },

    get hasSelectedCartridge() {
        return selectedCartridge;
    },

    setCartridgeVisible() {
        displayCartridges = true;
    },

    setCartridgeHidden() {
        displayCartridges = false;
    },

    setHasFinishedCartridgeScroll() {
        hasFinishedCartridgeScroll = true;
    },

    clearHasFinishedCartridgeScroll() {
        hasFinishedCartridgeScroll = false;
    },

    selectCartridge() {
        selectedCartridge = true;
    },

    deselectCartridge() {
        selectedCartridge = false;
    },

    togglePower() {
        isPowered = !isPowered;
    },
};
