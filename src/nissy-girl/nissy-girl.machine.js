import { createMachine, createActor } from "xstate";

import { nissyGirl } from "./nissy-girl.viewmodel.svelte";

import { inRange } from "./util/math";

import {
    ZOOM_ROTATION_THRESHOLD,
    MIN_PROGRESS,
    MAX_PROGRESS,
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

                            const targetRot = nissyGirl.rotation.project(delta);

                            const lower = Math.min(nissyGirl.rotation.progress, targetRot);
                            const upper = Math.max(nissyGirl.rotation.progress, targetRot);

                            const didWrap = lower < 0.1 && upper > 0.9;

                            return !didWrap && inRange(
                                ZOOM_ROTATION_THRESHOLD,
                                lower,
                                upper,
                            );
                        },

                        actions : [
                            () => nissyGirl.rotation.set(ZOOM_ROTATION_THRESHOLD),
                            ({ event }) => nissyGirl.setAnimationDirection(Math.sign(event.delta)),
                        ],
                        
                        target : "zooming",
                    },

                    {
                        actions : ({ event }) => nissyGirl.rotation.update(event.delta),
                    }
                ]
            }
        },

        zooming : {
            on : {
                DRAG_DELTA : [
                    {
                        guard : ({ event }) => {
                            if(nissyGirl.zoom.progress > MIN_PROGRESS) {
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
                            ({ event }) => nissyGirl.rotation.update(event.delta ),
                        ],

                        target : "playing",
                    },
                    {
                        // only advance once dragging continues in the same direction that finished the zoom
                        guard : ({ event }) =>
                            Math.sign(event.delta) === nissyGirl.zoomDir &&
                                nissyGirl.zoom.progress === MAX_PROGRESS,
                        target : "cartridge select",
                    },
                    { 
                        actions : ({ event }) =>
                            nissyGirl.zoom.update(event.delta * nissyGirl.zoomDir),
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
                            return (delta > 0 && nissyGirl.cartridge.progress === MIN_PROGRESS) ||
                                (delta < 0 && nissyGirl.cartridge.progress === MAX_PROGRESS);
                        },
                        target : "zooming",
                        actions : ({ event }) =>
                            nissyGirl.zoom.update(-event.delta * nissyGirl.animDir),
                    },
                    {
                        actions : ({ event }) => {
                            nissyGirl.cartridge.update(-event.delta);
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
