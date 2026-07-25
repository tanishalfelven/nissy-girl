import { createMachine, createActor } from "xstate";

import { nissyGirl } from "./nissy-girl.viewmodel.svelte";

import { crossedThreshold, crossedWrap } from "./util/math";

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
                            if(event.delta === 0) {
                                return false;
                            }

                            const targetRot = nissyGirl.rotation.project(event.delta);

                            return !crossedWrap(nissyGirl.rotation.progress, targetRot) &&
                                crossedThreshold(
                                    nissyGirl.rotation.progress,
                                    targetRot,
                                    ZOOM_ROTATION_THRESHOLD,
                                );
                        },
                        actions : () => nissyGirl.rotation.set(ZOOM_ROTATION_THRESHOLD),
                        target : "zooming",
                    },
                    {
                        actions : [
                            ({ event }) => nissyGirl.rotation.update(event.delta),
                            ({ event }) => nissyGirl.setAnimationDirection(Math.sign(event.delta)),
                        ],
                    }
                ]
            }
        },

        zooming : {
            exit : () => nissyGirl.zoom.applyProjection(),

            on : {
                DRAG_DELTA : [
                    {
                        guard : ({ event }) => nissyGirl.zoom.project(event.delta) === MIN_PROGRESS,
                        target : "playing",
                    },
                    {
                        // only advance once dragging continues in the same direction that finished the zoom
                        guard : ({ event }) => nissyGirl.zoom.project(event.delta) === MAX_PROGRESS,
                        target : "cartridge select",
                    },
                    { 
                        actions : ({ event }) => nissyGirl.zoom.update(event.delta),
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

                            const nextProgress = nissyGirl.cartridge.project(delta);

                            // past a cartridge boundary, hand back to zooming
                            return nextProgress === MAX_PROGRESS || nextProgress === MIN_PROGRESS;
                        },
                        target : "zooming",
                        actions : () => nissyGirl.cartridge.applyProjection(),
                    },
                    {
                        actions : ({ event }) => nissyGirl.cartridge.update(event.delta),
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
