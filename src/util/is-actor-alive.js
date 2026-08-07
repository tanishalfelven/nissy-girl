export const isActorAlive = (actor) =>
	actor?.getSnapshot?.()?.status === "active";
