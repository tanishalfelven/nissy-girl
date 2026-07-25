import { createVelocity } from "./velocity";

import { crossedThresholdInclusive, crossedWrap } from "./math";

import { MIN_PROGRESS, MAX_PROGRESS } from "../nissy-girl.consts";

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
    velocityCfg = false,
    velocityAnchors = [],
    update : updateFunc,
}) => {
    if(start < 0 || start > 1) {
        throw new Error(`Cannot create progress with start value ${start}`);
    }

    let _progress = $state(start);
    let projection = false;
    const velocity = createVelocity(velocityCfg);

    const progress = {
        get progress() {
            return _progress;
        },

        isMoving() {
            return velocity.value !== 0;
        },

        update(delta) {
            _progress = updateFunc(_progress, delta * speed);

            velocity.sample(delta * Math.abs(speed));

            projection = false;

            return _progress;
        },

        project(delta) {
            projection = updateFunc(_progress, delta * speed);

            return projection;
        },

        set(value) {
            if(value < 0 || value > 1) {
                throw new Error(`Cannot set progress to value ${value}`);
            }

            _progress = value;
            projection = false;
        },

        stepVelocity() {
            const movement = velocity.step();

            if(!this.isMoving() || !movement) {
                return _progress;
            }

            const previous = _progress;

            const next = this.project(movement);

            if(progress === MIN_PROGRESS ||
                progress === MAX_PROGRESS
            ) {
                velocity.stop();
            }

            for(const boundary of velocityAnchors) {
                if(!crossedWrap(previous, next) &&
                crossedThresholdInclusive(previous, next, boundary)) {
                    velocity.stop();
                    this.set(boundary);

                    break;
                }
            }

            this.applyProjection();

            return _progress;
        },

        stop() {
            velocity.stop();
            projection = false;
        },

        applyProjection() {
            if(projection === false) {
                return;
            }

            _progress = projection;
            projection = false;
        }
    };

    return progress;
};
