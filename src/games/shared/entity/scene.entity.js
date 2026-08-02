import { noopFalseFunction } from "$util/noop.js";

export const createScene = ({
	id,
	entities,
	start = noopFalseFunction,
	stop = noopFalseFunction,
	sendToGameActor,
	sendToGameMachine,
}) => {
	const scene = {
		id,
		start() {
			for(const entity of entities) {
				entity.start();
			}

			start(this);

			sendToGameActor({ type : "START_SCENE", scene });
		},

		stop() {
			for(const entity of entities) {
				entity.stop();
			}

			stop(this);

			sendToGameActor({ type : "REMOVE_SCENE" });
		},

		hasUpdate() {
			for(const entity of entities) {
				if(entity.hasUpdate()) {
					return true;
				}
			}

			return false;
		},

		update(dt) {
			for(const entity of entities) {
				if(entity.hasUpdate()) {
					entity.update(dt);
				}
			}
		},

		getRenderable() {
			const renderable = [];

			for(const entity of entities) {
				if(entity.hasRenderable()) {
					renderable.push(entity.getRenderable());
				}
			}

			return renderable;
		},
	};

	sendToGameActor({ type : "REGISTER_SCENE", scene });

	return scene;
};
