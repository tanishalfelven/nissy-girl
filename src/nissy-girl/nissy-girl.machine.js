import { createMachine, createActor } from "xstate";

import { nissyGirl } from "./nissy-girl.viewmodel.svelte";

import { inRange } from "./util/math";

import {
    ZOOM_ROTATION_THRESHOLD,
    ROTATE_STEP,
    MIN_ZOOM,
    MAX_ZOOM,
    ZOOM_STEP,
    CARTRIDGE_STEP,
    MIN_CARTRIDGE_POS,
    MAX_CARTRIDGE_POS,
} from "./nissy-girl.consts.js";

const nissyGirlMachine = createMachine({
    id : "nissy-girl",

    initial : "playing",

    states : {
        playing : {
            on : {
                DRAG_DELTA : [
                    {
                        guard : ({ event }) => {
                            const { delta } = event;

                            if(delta === 0) {
                                return false;
                            }

                            const targetRot = nissyGirl.rotation + delta * ROTATE_STEP;

                            return inRange(
                                ZOOM_ROTATION_THRESHOLD,
                                Math.min(nissyGirl.rotation, targetRot),
                                Math.max(nissyGirl.rotation, targetRot)
                            );
                        },

                        actions : [
                            () => nissyGirl.setRotation(ZOOM_ROTATION_THRESHOLD),
                            ({ event }) => nissyGirl.setAnimationDirection(Math.sign(event.delta)),
                        ],
                        
                        target : "zooming",
                    },

                    {
                        actions : ({ event }) => nissyGirl.addRotation(event.delta * ROTATE_STEP),
                    }
                ]
            }
        },

        zooming : {
            on : {
                DRAG_DELTA : [
                    {
                        guard : ({ event }) => {
                            if(nissyGirl.zoom > MIN_ZOOM) {
                                // zoom must be cleared to go back to rotation
                                return false;
                            }

                            const { delta } = event;

                            if(delta === 0) {
                                return false;
                            }

                            const dir = nissyGirl.hasFinishedCartridgeScroll ?
                                -nissyGirl.animDir :
                                nissyGirl.animDir;

                            // if we rotate away from the entry zoom, we can go back to rotating
                            return Math.sign(delta) !== Math.sign(dir);
                        },

                        actions : [
                            () => nissyGirl.clearAnimationDirection(),
                            ({ event }) => nissyGirl.addRotation(event.delta * ROTATE_STEP),
                        ],

                        target : "playing",
                    },
                    {
                        guard : ({ event }) => {
                            const dir = nissyGirl.hasFinishedCartridgeScroll ?
                                -nissyGirl.animDir :
                                nissyGirl.animDir;

                            return Math.sign(event.delta) === dir &&
                                nissyGirl.zoom === MAX_ZOOM;
                        },
                        target : "cartridge select",
                    },
                    {
                        actions : ({ event }) => {
                            const dir = nissyGirl.hasFinishedCartridgeScroll ?
                                -nissyGirl.animDir :
                                nissyGirl.animDir;

                            nissyGirl.addZoom(
                                event.delta * dir * ZOOM_STEP
                            );
                        },
                    }
                ]
            }
        },

        "cartridge select" : {
            invoke : [
                nissyGirl.invokeDisplayCartridges(),
            ],

            on : {
                DRAG_DELTA : [
                    {
                        guard : ({ event }) => {
                            const { delta } = event;

                            if(delta === 0) {
                                return false;
                            }

                            return (-delta < 0 && nissyGirl.cartridgeScrollPos === MIN_CARTRIDGE_POS) ||
                                (-delta > 0 && nissyGirl.cartridgeScrollPos === MAX_CARTRIDGE_POS);
                        },
                        target : "zooming",
                        actions : ({ event }) =>
                            nissyGirl.addZoom(
                                -event.delta * Math.sign(nissyGirl.animDir) * ZOOM_STEP
                            ),
                    },
                    {
                        actions : ({ event }) => {
                            nissyGirl.addCartridgeScroll(
                                -event.delta * CARTRIDGE_STEP
                            );
                        }
                    }
                ],
            },
        },
    },
});

const service = createActor(nissyGirlMachine);

export {
    service as nissyGirlMachine,
};
