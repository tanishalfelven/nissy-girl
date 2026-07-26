import { FPS60 } from "./time.js";

const DEFAULT_SMOOTHING = 0.4;
const DEFAULT_DECAY = 0.9;
const DEFAULT_MIN = 0.00001;

export const createVelocity = ({
    smoothing = DEFAULT_SMOOTHING,
    decay = DEFAULT_DECAY,
    min = DEFAULT_MIN,
    anchors = [],
} = false) => {
    let value = 0;
    let lastTime = false;

    return {
        get value() {
            return value;
        },

        isMoving() {
            return value !== 0;
        },

        getAnchors() {
            return anchors;
        },

        init({
            smoothing : updateSmoothing = DEFAULT_SMOOTHING,
            decay : updateDecay = DEFAULT_DECAY,
            min : updateMin = DEFAULT_MIN,
            anchors : updateAnchors = [],
        } = false) {
            smoothing = updateSmoothing;
            decay = updateDecay;
            min = updateMin;
            anchors = updateAnchors;

            lastTime = false;
        },

        sample(delta) {
            const time = performance.now();

            if(lastTime !== false) {
                const dt = Math.max((time - lastTime) / FPS60, 1);
                const measured = delta / dt;

                value += (measured - value) * smoothing;
            }

            lastTime = time;

            return value;
        },

        step(dt) {
            value *= Math.pow(decay, dt);

            if(Math.abs(value) < min) {
                value = 0;
            }

            return value * dt;
        },

        stop() {
            value = 0;
            lastTime = false;
        },
    };
};
