export const rafThrottle = (func) => {
    let scheduled = false;
    let lastArgs;

    return (...args) => {
        lastArgs = args;

        if (scheduled) {
            return;
        };

        scheduled = true;
        requestAnimationFrame(() => {
            scheduled = false;
            func(...lastArgs);
        });
    };
}