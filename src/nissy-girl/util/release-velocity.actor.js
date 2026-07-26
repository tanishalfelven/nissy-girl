import { fromCallback } from "xstate";

import { createVelocity } from "./velocity.js";

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

            let executeMove = movement !== 0 &&
                next !== previous;

            if(executeMove) {
                sendBack({ type : "MOVE", delta : movement });
            }

            if(progress.isAnchor(next)) {
                velocity.stop();
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
