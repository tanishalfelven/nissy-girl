let tree = $state(false);

export const statechart = {
	setTree : (treeSnapshot) => {
		tree = treeSnapshot;
	},

	getTree() {
		return tree;
	},
};
