import { fromCallback } from "xstate";

export const createProgress = ({
    start,
    update : updateFunc,
}) => {
    if(start < 0 || start > 1) {
        throw new Error(`Cannot create progress with start value ${start}`);
    }

    let _progress = $state(start);

    const progress = {
        get progress() {
            return _progress;
        },

        update(delta) {
            _progress = updateFunc(_progress, delta);

            return _progress;
        },

        project(delta) {
            return updateFunc(_progress, delta);
        },

        set(value) {
            if(value < 0 || value > 1) {
                throw new Error(`Cannot set progress to value ${value}`);
            }

            _progress = value;
        },

        round() {
            _progress = Math.round(_progress);
        }
    };

    return progress;
};

export const invokeObserveProgress = (id, progress) => ({
    id,
    src : fromCallback(() => {
        progress.round();

        return () => progress.round();
    }),
});
