let tree = $state([]);

export const statechart = {
	setTree : (treeSnapshot) => {
		tree = treeSnapshot;
	},

	getTree() {
		return tree;
	},
};
