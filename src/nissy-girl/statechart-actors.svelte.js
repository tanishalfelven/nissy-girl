let cameraActor = $state(false);

export const cameraService = {
	send : (event) => {
		cameraActor?.send?.(event);
	},

	set : (actor) => {
		cameraActor = actor;
	},
};
