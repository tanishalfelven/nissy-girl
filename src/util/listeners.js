export const domListenerSub = (node, id, func) => {
	node.addEventListener(id, func);

	return () => {
		if(node) {
			node.removeEventListener(id, func);
		}
	};
};

export const subscribers = () => {
	const all = new Map();

	return {
		subscribers : all,

		add : (id, remove) => {
			all.set(id, remove);

			return id;
		},

		has : (id) => {
			return all.has(id);
		},

		remove : (id) => {
			all.get(id)?.();

			all.delete(id);
		},

		removeAll : () => {
			for(const remove of all.values()) {
				remove();
			}

			all.clear();
		},
	};
};
