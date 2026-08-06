export const sceneAction = (func) => ({ system }) => {
	const scene = system.get("scene");

	func(scene.getSnapshot().context);
};
