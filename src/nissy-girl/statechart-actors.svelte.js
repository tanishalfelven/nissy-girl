let cameraActor = $state(false);
let tree = $state(false);

export const statechart = {
	send : (event) => {
		cameraActor?.broadcast?.(event);
	},

	set : (actor) => {
		cameraActor = actor;
	},

	setTree : (treeSnapshot) => {
		tree = treeSnapshot;
	},

	getTree() {
		return tree;
	},
};
