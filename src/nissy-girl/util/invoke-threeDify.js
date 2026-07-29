import { fromCallback } from "xstate";

import { rafLooper } from "./time";

import { clamp } from "./math";

const TARGET_FRAMES = 90;

export const invokeTweenProgress = (progress, from = 0, to = 1, frames = TARGET_FRAMES) => ({
    id : "tween-progress",
    src : fromCallback(({ sendBack }) => {
        let frameStep = (to - from) / frames;

        const WAIT_PERIOD = 3000;
        let waiting = 0;

        const loop = rafLooper((dt) => {
            if(waiting !== 0) {
                if(waiting < performance.now()) {
                    waiting = 0;
                    frameStep *= -1;
                } else {
                    return true;
                }
            }

            progress.update(frameStep);

            if(progress.progress === 1 || progress.progress === 0) {
                if(waiting === 0) {
                    waiting = performance.now() + WAIT_PERIOD;
                }
            }

            return true;
        });

        loop.start();

        () => {
            loop.stop();
        }
    }),
});
