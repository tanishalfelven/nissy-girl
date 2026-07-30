import { fromCallback } from "xstate";

import { createVelocity } from "./velocity.js";

import { rafLooper } from "./time.js";

export const ROTATE_VELOCITYID = "rotate-velocity";
export const VERT_VELOCITYID = "vert-velocity";

export const createReleaseVelocity = (id, eventName = "MOVE") => ({
    id,
    src : fromCallback(({ sendBack, receive }) => {
        const velocity = createVelocity();

        let progress = false;

        const velocityLoop = rafLooper((dt) => {
            if(!progress) {
                return;
            }

            const movement = velocity.step(dt);

            const previous = progress.progress;

            const next = progress.project(movement);

            let executeMove = movement !== 0 &&
                next !== previous;

            if(executeMove) {
                sendBack({ type : eventName, delta : movement });
            }

            if(progress?.isAnchor?.(next)) {
                velocity.stop();
            }

            return velocity.isMoving();
        });

        receive((event) => {
            if(event.type === "NEW_TARGET") {
                progress = event.progress;

                if(!progress) {
                    velocity.stop();

                    return;
                }

                velocity.init(progress.getVelocityConfig());

                return;
            }

            if(event.type === "DRAG_END" && progress) {
                if(!progress) {
                    return;
                }

                velocityLoop.start();

                return;
            }

            if(event.type === "DRAG_START" && progress) {
                if(!progress) {
                    return;
                }

                velocityLoop.stop();

                return;
            }

            if(event.type === "DRAG_DELTA") {
                if(!progress) {
                    return;
                }

                if(event.delta === 0) {
                    return;
                }

                velocity.sample(event.delta);

                sendBack({ type : eventName, delta : event.delta });

                return;
            }
        });
    }),
});
