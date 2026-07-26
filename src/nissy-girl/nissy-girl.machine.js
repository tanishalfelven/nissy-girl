import { createMachine, createActor, sendTo } from "xstate";

import { nissyGirl } from "./nissy-girl.viewmodel.svelte.js";

import { crossedThresholdWrapInclusive } from "./util/math.js";

import { releaseVelocity, RELEASE_VELOCITYID } from "./util/release-velocity.actor.js";

import {
    ZOOM_ROTATION_THRESHOLD,
    MIN_PROGRESS,
    MAX_PROGRESS,
} from "./nissy-girl.consts.js";

const updateVelocityTarget = (progress) =>
    sendTo(RELEASE_VELOCITYID, { type : "NEW_TARGET", progress });

const nissyGirlMachine = createMachine({
    id : "nissy-girl",

    initial : "playing",

    invoke : [
        releaseVelocity,
    ],

    on : {
        START_DRAG : {
            actions : sendTo(RELEASE_VELOCITYID, { type : "START_DRAG" }),
        },

        END_DRAG : {
            actions : sendTo(RELEASE_VELOCITYID, { type : "END_DRAG" }),
        },

        DRAG_DELTA : {
            actions : sendTo(RELEASE_VELOCITYID, ({ event }) => ({ type : "DRAG_DELTA", delta : event.delta })),
        },
    },

    states : {
        playing : {
            entry : updateVelocityTarget(nissyGirl.rotation),

            on : {
                MOVE : [
                    {
                        guard : ({ event }) => {
                            const targetRot = nissyGirl.rotation.project(event.delta);

                            if(nissyGirl.rotation.progress === ZOOM_ROTATION_THRESHOLD &&
                                Math.sign(event.delta) !== nissyGirl.effectiveDir
                            ) {
                                return false;
                            }

                            return crossedThresholdWrapInclusive(
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
            entry : updateVelocityTarget(nissyGirl.zoom),

            on : {
                MOVE : [
                    {
                        guard : ({ event }) => nissyGirl.zoom.project(event.delta) === MIN_PROGRESS,
                        target : "playing",
                        actions : ({ event }) => nissyGirl.zoom.update(event.delta),
                    },
                    {
                        guard : ({ event }) => nissyGirl.zoom.project(event.delta) === MAX_PROGRESS,
                        target : "cartridge select",
                        actions : ({ event }) => nissyGirl.zoom.update(event.delta),
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

            entry : updateVelocityTarget(nissyGirl.cartridge),

            on : {
                MOVE : [
                    {
                        guard : ({ event }) => {
                            const nextProgress = nissyGirl.cartridge.project(event.delta);

                            return nextProgress === MAX_PROGRESS || nextProgress === MIN_PROGRESS;
                        },
                        target : "zooming",
                        actions : ({ event }) => nissyGirl.cartridge.update(event.delta),
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
