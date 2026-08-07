import { rafThrottle } from "./time.js";

import { subscribers, domListenerSub } from "./listeners.js";

/**
 * Svelte action for touch delta controls
 * @param {HTMLElement} node svelte action node
 * @param {object} options handlers for touch actions
 * @param {(e: PointerEvent) => void} options.move triggered on move
 * @param {(e: PointerEvent) => void} [options.start] triggerd on pointerdown
 * @param {(e: PointerEvent) => void} options.end triggered on cancel/up
 */
export const touch = (node, {
	move,
	start = move,
	end,
}) => {
	let activePointerId = $state(false);
	let isDown = $state(false);

	let lastX = $state(0);
	let lastY = $state(0);

	const sub = subscribers();

	const handleEnd = (e) => {
		if(activePointerId !== false && activePointerId !== e.pointerId) {
			return;
		}

		node.releasePointerCapture(e.pointerId);
		e.preventDefault();
		e.stopPropagation();

		if(!isDown) {
			return;
		}

		activePointerId = false;

		isDown = false;

		end(e);

		sub.removeAll();
	};

	const handleMove = rafThrottle((e) => {
		if(!isDown) {
			return;
		}

		const newX = e.clientX;
		const newY = e.clientY;

		move(
			newX - lastX,
			newY - lastY,
			e,
		);

		lastX = newX;
		lastY = newY;
	});

	const handlerDown = (e) => {
		if(activePointerId !== false && activePointerId !== e.pointerId) {
			return;
		}

		e.preventDefault();
		e.stopPropagation();

		isDown = true;

		activePointerId = e.pointerId;

		node.setPointerCapture(e.pointerId);

		sub.add("pointermove", domListenerSub(node, "pointermove", (e) => {
			if(activePointerId !== false && activePointerId !== e.pointerId) {
				return;
			}

			e.preventDefault();
			e.stopPropagation();

			handleMove(e);
		}));
		sub.add("click", domListenerSub(node, "click", (e) => e.preventDefault()));
		sub.add("dblclick", domListenerSub(node, "dblclick", (e) => e.preventDefault()));
		sub.add("pointerup", domListenerSub(node, "pointerup", handleEnd));
		sub.add("pointercancel", domListenerSub(node, "pointercancel", handleEnd));

		lastX = e.clientX;
		lastY = e.clientY;

		start(e);
	};

	$effect(() => {
		const unsubDown = domListenerSub(node, "pointerdown", handlerDown);

		return () => {
			unsubDown();
			sub.removeAll();
		};
	});
};

/**
 * Svelte action for physical buttons that only have an on/off state
 * @param {HTMLElement} node svelte action node
 * @param {object} options event handlers for action
 * @param {(e: PointerEvent) => void} options.fire triggers on move/down
 * @param {(e: PointerEvent) => void} options.end triggers on up/cancel/leave
 */
export const controls = (node, {
	fire,
	end,
}) => {
	const sub = subscribers();

	let canTrigger = $state(true);
	let activePointerId = $state(false);

	const handleEnd = (e) => {
		if(activePointerId !== e.pointerId) {
			return;
		}

		e.stopPropagation();
		e.preventDefault();
		node.releasePointerCapture(e.pointerId);

		activePointerId = false;

		canTrigger = false;

		// A small bounded timeout for trigger end - this solves drag off triggering controls
		requestAnimationFrame(() => {
			canTrigger = true;
		});

		end(e);
	};

	const handleMove = rafThrottle((e) => {
		if(e.buttons === 1 && canTrigger) {
			fire(e);
		}
	});

	const handlerDown = (e) => {
		if(activePointerId !== false && activePointerId !== e.pointerId) {
			return;
		}

		e.preventDefault();
		e.stopPropagation();

		activePointerId = e.pointerId;
		node.setPointerCapture(e.pointerId);

		fire(e);
	};

	$effect(() => {
		sub.add("pointerdown", domListenerSub(node, "pointerdown", handlerDown));
		sub.add("click", domListenerSub(node, "click", (e) => e.preventDefault()));
		sub.add("dblclick", domListenerSub(node, "dblclick", (e) => e.preventDefault()));
		sub.add("pointermove", domListenerSub(node, "pointermove", (e) => {
			if(activePointerId !== e.pointerId) {
				return;
			}

			e.preventDefault();
			e.stopPropagation();

			handleMove(e);
		}));
		sub.add("pointerup", domListenerSub(node, "pointerup", handleEnd));
		sub.add("pointercancel", domListenerSub(node, "pointercancel", handleEnd));
		sub.add("pointerleave", domListenerSub(node, "pointerleave", handleEnd));

		return () => {
			sub.removeAll();
		};
	});
};
