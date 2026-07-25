import { fromCallback } from "xstate";

const FPS60 = 16.66;

export const createVelocity = ({
    smoothing = 0.4,
    decay = 0.9,
    min = 0.00001,
} = false) => {
    let value = 0;
    let lastTime = false;

    return {
        get value() {
            return value;
        },

        sample(delta, time = performance.now()) {
            if(lastTime !== false) {
                const dt = Math.max((time - lastTime) / FPS60, 1);
                const measured = delta / dt;

                value += (measured - value) * smoothing;
            }

            lastTime = time;

            return value;
        },

        step(time = performance.now()) {
            const dt = Math.max((time - lastTime) / FPS60, 1);

            value *= Math.pow(decay, dt);

            if(Math.abs(value) < min) {
                value = 0;
            }

            lastTime = time;

            return value * dt;
        },

        stop() {
            value = 0;
            lastTime = false;
        },
    };
};

export const RELEASE_VELOCITYID = "release-velocity";

export const releaseVelocity = ({
    id : RELEASE_VELOCITYID,
    src : fromCallback(({ receive }) => {
        let progress = false;
        let id = false;
        let prevTime = 0;

        const stopAnimation = () => {
            if (id) {
                cancelAnimationFrame(id);
                id = false;
            }
        }

        const loop = (timestamp) => {
            if(!progress) {
                stopAnimation();

                return;
            }

            progress.stepVelocity();

            if(progress.isMoving()) {
                id = requestAnimationFrame(loop);
            }
        }

        const startAnimation = () => {
            if (!id) {
                id = requestAnimationFrame(loop);
            }
        }

        receive((event) => {
            if(event.type === "TRACK_PROGRESS") {
                if(progress) {
                    progress.stop();

                    stopAnimation();
                }

                progress = event.progress;

                return;
            }

            if(event.type === "START_DRAG" && progress) {
                stopAnimation();

                return;
            }

            if(event.type === "END_DRAG" && progress) {
                startAnimation();

                return;
            }
        });
    }),
});
