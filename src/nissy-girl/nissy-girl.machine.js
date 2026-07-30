import {
    createMachine,
    createActor,
    sendTo,
    raise,
} from "xstate";

import { nissyGirl } from "./nissy-girl.viewmodel.svelte.js";

import { crossedThresholdWrapInclusive } from "./util/math.js";

import {
    createReleaseVelocity,
    ROTATE_VELOCITYID,
    VERT_VELOCITYID,
} from "./util/release-velocity.actor.js";

import {
    ZOOM_ROTATION_THRESHOLD,
    CARTRIDGE_SELECTION_THRESHOLD,
    MIN_PROGRESS,
    MAX_PROGRESS,
} from "./nissy-girl.consts.js";

const updateVelocityTarget = (target, progress) =>
    sendTo(target, { type : "NEW_TARGET", progress });

const nissyGirlMachine = createMachine({
    id : "nissy-girl",

    initial : "playing",

    invoke : [
        createReleaseVelocity(ROTATE_VELOCITYID, "ROTATE_SWIPE"),
    ],

    on : {
        DRAG_START : {
            actions : sendTo(ROTATE_VELOCITYID, { type : "DRAG_START" }),
        },

        DRAG_END : {
            actions : sendTo(ROTATE_VELOCITYID, { type : "DRAG_END" }),
        },

        DRAG_DELTA : {
            actions : sendTo(ROTATE_VELOCITYID, ({ event }) => ({ type : "DRAG_DELTA", delta : event.delta })),
        },
    },

    states : {
        playing : {
            entry : [
                updateVelocityTarget(ROTATE_VELOCITYID, nissyGirl.rotation),
            ],

            on : {
                ROTATE_SWIPE : [
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

                            // prepares us to re-enter cartridge scroll
                            nissyGirl.clearHasFinishedCartridgeScroll();

                            if(nissyGirl.hasSelectedCartridge) {
                                return;
                            }

                            // agressively resetting cartridge carousel so it comes from the correct direction
                            nissyGirl.cartridgeX.set(event.delta < 0 ? MIN_PROGRESS : MAX_PROGRESS);
                        },
                    }
                ]
            }
        },

        zooming : {
            entry : updateVelocityTarget(ROTATE_VELOCITYID, nissyGirl.zoom),

            on : {
                CART_DRAG_START : {
                    actions : raise({ type : "TEST_ZOOM_BOUNDS" }),
                },

                CART_DRAG_DELTA : {
                    actions: raise(({ event }) => ({ type : "HANDLE_DRAG", delta: event.delta })),
                },

                ROTATE_SWIPE : {
                    actions: raise(({ event }) => ({ type : "HANDLE_DRAG", delta: event.delta })),
                },

                HANDLE_DRAG : {
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
                        target : "cartridge select.cartridge manipulate",
                    },
                    {
                        guard : () => !nissyGirl.hasFinishedCartridgeScroll,
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
                    entry : updateVelocityTarget(ROTATE_VELOCITYID, nissyGirl.cartridgeX),

                    on : {
                        CART_DRAG_DELTA : {
                            guard : ({ event }) => event.delta > 0,
                            actions : raise((event) => ({ type : "SELECT_CARTRIDGE" })),
                        },

                        ROTATE_SWIPE : {
                            actions : [
                                ({ event }) => nissyGirl.cartridgeX.update(event.delta),
                                raise({ type : "TEST_CARTRIDGE_X_BOUNDS" }),
                            ],
                        },

                        TEST_CARTRIDGE_X_BOUNDS : {
                            guard : () => nissyGirl.cartridgeX.progress === MAX_PROGRESS ||
                                nissyGirl.cartridgeX.progress === MIN_PROGRESS,
                            actions : raise({ type : "BACK_TO_ZOOM" }),
                        },

                        SELECT_CARTRIDGE : {
                            guard : () =>
                                nissyGirl.cartridgeX.progress === CARTRIDGE_SELECTION_THRESHOLD,
                            target : "cartridge manipulate",
                        },
                    }
                },

                // Vertically move cartridge (selection is maximum progress, deselect is minimum!)
                "cartridge manipulate" : {
                    invoke : createReleaseVelocity(VERT_VELOCITYID, "CART_SWIPE"),

                    entry : [
                        updateVelocityTarget(VERT_VELOCITYID, nissyGirl.cartridgeY),
                        updateVelocityTarget(ROTATE_VELOCITYID, nissyGirl.cartridgeY),
                    ],

                    on : {
                        CART_DRAG_START : {
                            actions : sendTo(VERT_VELOCITYID, { type : "DRAG_START" }),
                        },

                        CART_DRAG_END : {
                            actions : sendTo(VERT_VELOCITYID, { type : "DRAG_END" }),
                        },

                        CART_DRAG_DELTA : {
                            actions : sendTo(
                                VERT_VELOCITYID,
                                ({ event }) => ({
                                    type : "DRAG_DELTA",
                                    delta : event.delta,
                                }
                            )),
                        },

                        CART_SWIPE : {
                            actions : [
                                ({ event }) => nissyGirl.cartridgeY.update(event.delta),
                            ],
                        },

                        // proxying horizontal swipe to cartridge progress is tough
                        // I dislike canonical entry direction as "yes" or opposite as "no"
                        ROTATE_SWIPE : {
                            actions : [
                                raise({ type : "TEST_CARTRIDGE_Y_BOUNDS" }),
                            ],
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
