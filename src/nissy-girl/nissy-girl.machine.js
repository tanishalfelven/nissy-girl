import {
    createMachine,
    createActor,
    sendTo,
    raise,
} from "xstate";

import { nissyGirl } from "./nissy-girl.viewmodel.svelte.js";

import { crossedThresholdWrapInclusive } from "./util/math.js";

import { releaseVelocity, RELEASE_VELOCITYID } from "./util/release-velocity.actor.js";

import {
    ZOOM_ROTATION_THRESHOLD,
    CARTRIDGE_THRESHOLD,
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

        BACK_TO_ZOOM : ".zooming",
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
                        guard : ({ event }) => nissyGirl.zoom.project(event.delta) === MAX_PROGRESS &&
                            !nissyGirl.hasFinishedCartridgeScroll,
                        target : "cartridge select.move selection",
                        actions : ({ event }) => nissyGirl.zoom.update(event.delta),
                    },
                    {
                        guard : ({ event }) => nissyGirl.zoom.project(event.delta) === MAX_PROGRESS &&
                            !nissyGirl.hasFinishedCartridgeScroll,
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
            entry : () => nissyGirl.setCartridgeVisible(),

            exit : () => {
                if(!nissyGirl.hasSelectedCartridge()) {
                    nissyGirl.setCartridgeHidden();
                }
            },

            initial : "selecting",

            states : {
                selecting : {
                    entry : updateVelocityTarget(nissyGirl.cartridge),

                    on : {
                        MOVE : [
                            {
                                guard : ({ event }) => {
                                    const nextProgress = nissyGirl.cartridge.project(event.delta);

                                    return nextProgress === MAX_PROGRESS || nextProgress === MIN_PROGRESS;
                                },
                                actions : [
                                    ({ event }) => nissyGirl.cartridge.update(event.delta),
                                    () => nissyGirl.setCartridgeHidden(),
                                    raise({ type : "BACK_TO_ZOOM" }),
                                ],
                            },
                            {
                                actions : ({ event }) => nissyGirl.cartridge.update(event.delta),
                            }
                        ],

                        SELECT_CARTRIDGE : {
                            guard : () => nissyGirl.cartridge.progress === CARTRIDGE_THRESHOLD,
                            target : "move selection",
                        },
                    }
                },

                "move selection" : {
                    entry : updateVelocityTarget(false),

                    on : {
                        START_CARTDRAG : {
                            actions : sendTo(RELEASE_VELOCITYID, { type : "START_DRAG" }),
                        },

                        END_CARTDRAG : {
                            actions : sendTo(RELEASE_VELOCITYID, { type : "END_DRAG" }),
                        },

                        CARTDRAG_DELTA : {
                            actions : ({ event }) => nissyGirl.cartridgeY.update(event.delta),
                        },

                        DRAG_DELTA : {
                            actions : raise(({ event }) => ({ type : "ROTATE_DRAG", delta : event.delta })),
                        },

                        ROTATE_DRAG : [
                            {
                                guard : ({ event }) => nissyGirl.cartridgeY.progress === MIN_PROGRESS,
                                actions : () => nissyGirl.deselectCartridge(),
                                target : "selecting",
                            },
                            {
                                guard : ({ event }) => nissyGirl.cartridgeY.progress === MAX_PROGRESS,
                                actions : [
                                    () => nissyGirl.selectCartridge(),
                                    raise({ type : "BACK_TO_ZOOM" }),
                                ],
                            },
                            {
                                actions : ({ event }) => nissyGirl.cartridgeY.update(event.delta),
                            }
                        ],
                    }
                },
            }
        },
    },
});

const service = createActor(nissyGirlMachine);

export {
    service as nissyGirlMachine,
};
