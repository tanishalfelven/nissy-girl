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
    CARTRIDGE_SELECTION_THRESHOLD,
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
                        // This is a bit odd but we don't bother creating an anchor for our
                        // rotation threshold BECAUSE we want to preserve momentum
                        guard : ({ event }) => {
                            const targetRot = nissyGirl.rotation.project(event.delta);

                            // Replicating anchor logic here - this lets us continue reotation
                            // upon return
                            if(nissyGirl.rotation.progress === ZOOM_ROTATION_THRESHOLD &&
                                nissyGirl.hasFinishedCartridgeScroll
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
                        actions : ({ event }) => {
                            nissyGirl.rotation.update(event.delta);
                            nissyGirl.clearHasFinishedCartridgeScroll();

                            if(nissyGirl.hasSelectedCartridge) {
                                return;
                            }

                            // agressively resetting cartridge carousel so it comes from the correct direction
                            nissyGirl.cartridge.set(event.delta < 0 ? MIN_PROGRESS : MAX_PROGRESS);
                        },
                    }
                ]
            }
        },

        zooming : {
            entry : updateVelocityTarget(nissyGirl.zoom),

            on : {
                START_CARTDRAG : {
                    actions : raise({ type : "HANDLE_CART_DRAG" }),
                },

                CARTDRAG_DELTA : {
                    actions : raise({ type : "HANDLE_CART_DRAG" }),
                },

                HANDLE_CART_DRAG : [
                    {
                        guard : () => nissyGirl.zoom.progress === MAX_PROGRESS &&
                            nissyGirl.cartridgeY.progress === MAX_PROGRESS,
                        target : "cartridge select.vertical cartridge manipulate",
                    }
                ],

                MOVE : {
                    actions: [
                        ({ event }) => nissyGirl.zoom.update(event.delta),
                        raise({ type : "TEST_ZOOM_BOUNDS" }),
                    ],
                },

                TEST_ZOOM_BOUNDS : [
                    {
                        guard : () => nissyGirl.zoom.progress === MAX_PROGRESS,
                        actions : raise({ type : "SCROLL_AT_MAX_CARTRIDGE_SELECT" }),
                    },
                    {
                        guard : () => nissyGirl.zoom.progress === MIN_PROGRESS,
                        target : "playing",
                    }
                ],

                SCROLL_AT_MAX_CARTRIDGE_SELECT : [
                    {
                        guard : () => nissyGirl.hasSelectedCartridge,
                        target : "cartridge select.vertical cartridge manipulate",
                    },
                    {
                        guard : () => !nissyGirl.hasFinishedCartridgeScroll && !nissyGirl.hasSelectedCartridge,
                        target : "cartridge select",
                    }
                ],
            },
        },

        "cartridge select" : {
            entry : () => nissyGirl.setCartridgeVisible(),

            on : {
                BACK_TO_ZOOM : {
                    target : "zooming",
                    actions : () => {
                        if(!nissyGirl.hasSelectedCartridge) {
                            nissyGirl.setCartridgeHidden();
                        }

                        nissyGirl.setHasFinishedCartridgeScroll()
                    }, 
                }
            },

            initial : "carousel",

            states : {
                // Horizontal carousel through cartridges!
                carousel : {
                    entry : updateVelocityTarget(nissyGirl.cartridge),

                    on : {
                        CARTDRAG_DELTA : {
                            guard : ({ event }) => event.delta > 0,
                            actions : raise((event) => ({ type : "SELECT_CARTRIDGE" })),
                        },

                        MOVE : {
                            actions : [
                                ({ event }) => nissyGirl.cartridge.update(event.delta),
                                raise({ type : "CARTRIDGE_AT_MAX_BOUNDS" }),
                            ],
                        },

                        CARTRIDGE_AT_MAX_BOUNDS : {
                            guard : () => nissyGirl.cartridge.progress === MAX_PROGRESS ||
                                nissyGirl.cartridge.progress === MIN_PROGRESS,
                            actions : raise({ type : "BACK_TO_ZOOM" }),
                        },

                        SELECT_CARTRIDGE : {
                            guard : () =>
                                nissyGirl.cartridge.progress === CARTRIDGE_SELECTION_THRESHOLD,
                            target : "vertical cartridge manipulate",
                        },
                    }
                },

                // Vertically move cartridge (selection is maximum progress, deselect is minimum!)
                "vertical cartridge manipulate" : {
                    entry : updateVelocityTarget(false),

                    on : {
                        START_CARTDRAG : {
                            actions : raise({ type : "HANDLE_CART_DRAG" }),
                        },

                        END_CARTDRAG : {
                            actions : raise({ type : "HANDLE_CART_DRAG" }),
                        },

                        CARTDRAG_DELTA : {
                            actions : raise(({ event }) => ({ type : "HANDLE_CART_DRAG", delta : event.delta })),
                        },

                        HANDLE_CART_DRAG : {
                            actions : [
                                ({ event}) => nissyGirl.cartridgeY.update(event?.delta ?? 0),
                                raise({ type : "TEST_CARTRIDGE_Y_BOUNDS" }),
                            ],
                        },

                        DRAG_DELTA : {
                            actions : raise({ type : "TEST_CARTRIDGE_Y_BOUNDS" }),
                        },

                        TEST_CARTRIDGE_Y_BOUNDS : [
                            {
                                guard : () => nissyGirl.cartridgeY.progress === MIN_PROGRESS,
                                actions : () => nissyGirl.deselectCartridge(),
                                target : "carousel",
                            },
                            {
                                guard : () => nissyGirl.cartridgeY.progress === MAX_PROGRESS,
                                actions : [
                                    () => nissyGirl.selectCartridge(),
                                    raise({ type : "BACK_TO_ZOOM" }),
                                ],
                            },
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
