import { TRIGGERED, RELEASED } from "$game/shared/input.consts.js";

export const inputTriggered = ({ event }) => event.state === TRIGGERED;
export const inputReleased = ({ event }) => event.state === RELEASED;
