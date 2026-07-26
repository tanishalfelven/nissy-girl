import { MIN_PROGRESS, MAX_PROGRESS } from "../nissy-girl.consts";
import { crossedThresholdWrapInclusive } from "./math.js";

/**
 * @param {object} options
 * @param {number} options.start
 * @param {number} options.speed
 * @param {(cur: number, movement: number) => number} options.update 
 * @returns
 */
export const createProgress = ({
    start,
    speed,
    anchors : anchorInput = [],
    update : updateFunc,
    velocity,
}) => {
    if(start < 0 || start > 1) {
        throw new Error(`Cannot create progress with start value ${start}`);
    }

    const anchors = new Set(anchorInput);

    let _progress = $state(start);

    const calc = (delta) => {
        const val = updateFunc(_progress, delta * speed);


        for(const boundary of anchors) {
            if(boundary === _progress) {
                continue;
            }

            if(crossedThresholdWrapInclusive(_progress, val, boundary)) {
                return boundary;
            }
        }

        return val;
    };

    const progress = {
        get progress() {
            return _progress;
        },

        getVelocityConfig() {
            return velocity;
        },

        update(delta) {
            _progress = calc(delta);

            return _progress;
        },

        project(delta) {
            return calc(delta);
        },

        isAnchor(position) {
            return anchors.has(position);
        },

        set(value) {
            if(value < MIN_PROGRESS || value > MAX_PROGRESS) {
                throw new Error(`Cannot set progress to value ${value}`);
            }

            _progress = value;
        },
    };

    return progress;
};
