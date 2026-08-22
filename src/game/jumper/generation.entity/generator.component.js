export const createGenerator = ({
	world,
	capabilities,
}) => {
	return {
		async load() {
			world.world.notifyGame({ type : "CACHE_GENERATION", data : capabilities.get() });
			world.world.notifyGame({ type : "DONE" });
		},
	};
};
