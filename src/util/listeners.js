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
			if(all.has(id)) {
				/* eslint-disable-next-line no-console */
				console.warn(`already subscribed to id ${id}`);

				return false;
			}

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
