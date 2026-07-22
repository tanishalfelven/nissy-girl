import { roundHundredths, wrap, clamp } from "./util/math";

import { fromCallback } from "xstate";

import {
    MIN_ZOOM,
    MAX_ZOOM,
    MIN_CARTRIDGE_POS,
    MAX_CARTRIDGE_POS,
} from "./nissy-girl.consts.js";

let rotation = $state(0);
let isPowered = $state(false);
let zoom = $state(MIN_ZOOM);
let animDir = $state(0);
let cartridgeScrollPos = $state(0);
let displayCartridges = $state(false);
let hasFinishedCartridgeScroll = $derived(
    cartridgeScrollPos ===
        (animDir === 1 ? MIN_CARTRIDGE_POS : MAX_CARTRIDGE_POS)
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

    get cartridgeScrollPos() {
        return cartridgeScrollPos;
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

    setAnimationDirection(newAnimDir) {
        animDir = newAnimDir;

        cartridgeScrollPos = newAnimDir < 0 ? MIN_CARTRIDGE_POS : MAX_CARTRIDGE_POS;
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

    addCartridgeScroll(scrollDelta) {
        cartridgeScrollPos = clamp(
            roundHundredths(cartridgeScrollPos + scrollDelta),
            MIN_CARTRIDGE_POS,
            MAX_CARTRIDGE_POS,
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
