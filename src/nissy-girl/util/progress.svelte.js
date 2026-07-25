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
}) => {
    if(start < 0 || start > 1) {
        throw new Error(`Cannot create progress with start value ${start}`);
    }

    let _progress = $state(start);
    /** @type {number|false} */
    let projection = false;

    const progress = {
        get progress() {
            return _progress;
        },

        update(delta) {
            _progress = updateFunc(_progress, delta * speed);

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

        applyProjection() {
            if(projection === false) {
                return;
            }

            _progress = projection;
        }
    };

    return progress;
};
