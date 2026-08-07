// todo This is bad, at the least we should probably use a WeakMap
let activeSceneRef = false;

const getAndCacheScene = ({ system }) => {
	if(!activeSceneRef || !activeSceneRef?.isAlive) {
		const scene = system.get("scene");

		activeSceneRef = scene.getSnapshot().context;
	}

	return activeSceneRef;
};

export const withScene = (func) => (all) => {
	return func(getAndCacheScene(all));
};

/**
 * sceneAction forces a frame unless returns `false
 * @param {() => void} func func receives xstate and scene
 * @returns {() => void}
 */
export const sceneAction = (func) => (all) => {
	const result = func(all, getAndCacheScene(all));

	if(result !== false) {
		const gameloop = all.system.get("gameloop");

		gameloop.send({ type : "START" });
	}
};
