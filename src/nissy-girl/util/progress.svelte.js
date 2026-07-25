export const getProgress = ({
    start,
    update : updateFunc,
}) => {
    if(start < 0 || start > 1) {
        throw new Error("Cannot create progress with start value ", start);
    }

    let _progress = $state(start);

    const progress = {
        get progress() {
            return _progress;
        },

        update(delta) {
            _progress = updateFunc(delta);

            return _progress;
        },

        project(delta) {
            return updateFunc(delta);
        },

        set(value) {
            _progress = value;
        },
    };

    return progress;
};
