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

                            // if we rotate away from the entry zoom, we can go back to rotating
                            return Math.sign(delta) !== nissyGirl.zoomDir;
                        },

                        actions : [
                            () => nissyGirl.clearAnimationDirection(),
                            ({ event }) => nissyGirl.addRotation(event.delta * ROTATE_STEP),
                        ],

                        target : "playing",
                    },
                    {
                        // only advance once dragging continues in the same direction that finished the zoom
                        guard : ({ event }) =>
                            Math.sign(event.delta) === nissyGirl.zoomDir &&
                                nissyGirl.zoom === MAX_ZOOM,
                        target : "cartridge select",
                    },
                    { 
                        actions : ({ event }) =>
                            nissyGirl.addZoom(
                                event.delta * nissyGirl.zoomDir * ZOOM_STEP
                            ),
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

                            // past a cartridge boundary, hand back to zooming
                            return (delta > 0 && nissyGirl.cartridgeScrollPos === MIN_CARTRIDGE_POS) ||
                                (delta < 0 && nissyGirl.cartridgeScrollPos === MAX_CARTRIDGE_POS);
                        },
                        target : "zooming",
                        actions : ({ event }) =>
                            nissyGirl.addZoom(
                                -event.delta * nissyGirl.animDir * ZOOM_STEP
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
