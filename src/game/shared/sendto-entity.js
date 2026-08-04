import { sendTo } from "xstate";

const identity = (a) => a;

export const sendToEntity = (id, eventCreator = identity) => {
	if(typeof eventCreator === "function") {
		return sendTo(
			"gameloop",
			({ event }) => ({
				type : "ENTITY_MESSAGE",
				entityId : id,
				event : eventCreator(event),
			}),
		);
	}

	return sendTo("gameloop", { type : "ENTITY_MESSAGE", entityId : id, event : eventCreator });
};
