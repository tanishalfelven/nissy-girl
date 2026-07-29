import { rafThrottle } from "./time";

const eventSub = (node, id, func) => {
    node.addEventListener(id, func);

    return () => {
        if(node) {
            node.removeEventListener(id, func);;
        }
    }
};

const subcribers = () => {
    const all = new Map();
    let idx = 0;

    return {
        add : (id = idx++, remove) => {
            all.set(id, remove);

            return id;
        },

        remove : (id) => {
            all.get(id)?.();
        },

        removeAll : () => {
            for(const remove of all.values()) {
                remove();
            }

            all.clear();
        }
    }
};

export const touch = (node, options = false) => {
    let isDown = false;

    const sub = subcribers();

    const handleEnd = (e) => {
        sub.removeAll();

        if(!isDown) {
            return;
        }

        isDown = false;

        options?.end?.(e);
    };

    const handleMove = rafThrottle((e) => {
        if(!isDown) {
            return;
        }

        options?.move?.(e);
    });

    const handlerDown = (e) => {
        isDown = true;

        e.preventDefault();

        node.setPointerCapture(e.pointerId);

        sub.add("pointermove", eventSub(node, "pointermove", handleMove));
        sub.add("pointerup", eventSub(node, "pointerup", handleEnd));
        sub.add("pointercancel", eventSub(node, "pointercancel", handleEnd));
        sub.add("pointerleave", eventSub(node, "pointerleave", handleEnd));

        (options?.start || options?.move)?.(e);
    };

    $effect(() => {
        const unsubDown = eventSub(node, "pointerdown", handlerDown);

        return () => {
            unsubDown();
            sub.removeAll();
        }
    });
};

export const controls = (node, options = false) => {
    const sub = subcribers();

    let canTrigger = $state(true);

    const handleEnd = (e) => {
        canTrigger = false;

        requestAnimationFrame(() => {
            canTrigger = true;
        });

        options.end(e);
    };

    const handleMove = rafThrottle((e) => {
        if(e.buttons === 1 && canTrigger) {
            options.fire(e);
        }
    });

    const handlerDown = (e) => {
        e.preventDefault();

        node.releasePointerCapture(e.pointerId);

        options.fire(e);
    };


    $effect(() => {
        sub.add("pointerdown", eventSub(node, "pointerdown", handlerDown));
        sub.add("pointermove", eventSub(node, "pointermove", handleMove));
        sub.add("pointerup", eventSub(node, "pointerup", handleEnd));
        sub.add("pointercancel", eventSub(node, "pointercancel", handleEnd));
        sub.add("pointerleave", eventSub(node, "pointerleave", handleEnd));

        return () => {
            sub.removeAll();
        }
    });
};
