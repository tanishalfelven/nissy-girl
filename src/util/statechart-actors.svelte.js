let innerStatechart = $state(false);
let tree = $state(false);

export const statechart = {
	send : (event) => {
		innerStatechart?.broadcast?.(event);
	},

	set : (actor) => {
		innerStatechart = actor;
	},

	setTree : (treeSnapshot) => {
		tree = treeSnapshot;
	},

	getTree() {
		return tree;
	},
};
