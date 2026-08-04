import { sendTo } from "xstate";

const identity = (a) => a;

export const sendToEntity = (id, eventCreator = identity) => {
	if(typeof eventCreator === "function") {
		return sendTo(
			"game",
			({ event }) => ({
				type : "ENTITY_MESSAGE",
				entityId : id,
				event : eventCreator(event),
			}),
		);
	}

	return sendTo("game", { type : "ENTITY_MESSAGE", entityId : id, event : eventCreator });
};
