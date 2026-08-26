import { TRIGGERED } from "$game/shared/input.consts.js";

export const inputTriggered = ({ event }) => event.state === TRIGGERED;
