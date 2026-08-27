// ! Currently only a single scene is active at once
// ! Current scene is also stored in gameloop machine but
// ! Access is awkward, so we match it here and let scene.actor maintain
let storedScene = false;

export const setScene = (scene) => {
	storedScene = scene;
};

export const clearScene = (scene) => {
	if(storedScene === scene) {
		storedScene = false;
	}
};

export const withScene = (func) => (all) => {
	return func(all, storedScene);
};

/**
 * sceneAction forces a frame unless returns `false
 * @param {() => void} func func receives xstate and scene
 * @returns {() => void}
 */
export const sceneAction = (func) => (all) => {
	const result = func(all, storedScene);

	if(result !== false) {
		const gameloop = all.system.get("gameloop");

		gameloop.send({ type : "START" });
	}
};
