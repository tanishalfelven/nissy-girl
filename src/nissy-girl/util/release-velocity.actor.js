import { fromCallback } from "xstate";

import { createVelocity } from "./velocity.js";

import { crossedThresholdWrapInclusive } from "./math.js";

import { MIN_PROGRESS, MAX_PROGRESS } from "../nissy-girl.consts.js";

import { rafLooper } from "./time.js";

export const RELEASE_VELOCITYID = "release-velocity";

export const releaseVelocity = ({
    id : RELEASE_VELOCITYID,
    src : fromCallback(({ sendBack, receive }) => {
        const velocity = createVelocity();

        let progress = false;

        const velocityLoop = rafLooper((dt) => {
            const movement = velocity.step(dt);

            const previous = progress.progress;

            const next = progress.project(movement);

            let executeMove = movement !== 0;

            for(const boundary of velocity.getAnchors()) {
                if(crossedThresholdWrapInclusive(previous, next, boundary)) {
                    velocity.stop();
                    progress.set(boundary);

                    executeMove = false;

                    break;
                }
            }

            if(executeMove) {
                sendBack({ type : "MOVE", delta : movement });
            }

            return velocity.isMoving();
        });

        receive((event) => {
            if(event.type === "NEW_TARGET") {
                progress = event.progress;

                velocity.init(progress.getVelocityConfig());

                return;
            }

            if(event.type === "END_DRAG" && progress) {
                velocityLoop.start();

                return;
            }

            if(event.type === "START_DRAG" && progress) {
                velocityLoop.stop();

                return;
            }

            if(event.type === "DRAG_DELTA") {
                if(event.delta === 0) {
                    return;
                }

                velocity.sample(event.delta);

                sendBack({ type : "MOVE", delta : event.delta });

                return;
            }
        });
    }),
});
