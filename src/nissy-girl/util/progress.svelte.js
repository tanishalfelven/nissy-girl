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
    update : updateFunc,
    velocity,
}) => {
    if(start < 0 || start > 1) {
        throw new Error(`Cannot create progress with start value ${start}`);
    }

    let _progress = $state(start);

    const calc = (delta) => updateFunc(_progress, delta * speed);

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

        set(value) {
            if(value < MIN_PROGRESS || value > MAX_PROGRESS) {
                throw new Error(`Cannot set progress to value ${value}`);
            }

            _progress = value;
        },
    };

    return progress;
};
