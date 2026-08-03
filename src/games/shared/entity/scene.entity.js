import { noopFalseFunction } from "$util/noop.js";

import { loadImageData } from "$util/image.js";
import { createSprite } from "$util/sprite.js";

/** @import { Renderable } from "$nissy-girl/screens/render.consts.js" */
/** @import { Sprite } from "$util/sprite.js" */

/**
 * @typedef {object} Entity
 * @property {() => void} start lifecycle
 * @property {() => void} stop lifecycle
 * @property {() => boolean} hasUpdate if should update
 * @property {() => void} update lifecycle
 * @property {() => Renderable|Renderable[]} getRenderable get renderable for entity
 * @property {() => Record<string, string>} [getSpriteRequests] optional: sprite key -> image url this entity needs
 * @property {(sprites: Record<string, Sprite>) => void} [setSprites] optional: receives loaded sprites, keyed the same as getSpriteRequests
 */

/**
 * @typedef {object} SceneEntity
 * @property {() => void} start lifecycle
 * @property {() => void} stop lifecycle
 * @property {() => boolean} hasUpdate if should update
 * @property {() => void} update lifecycle
 * @property {() => Renderable[]} getRenderables get renderable for entity
 */

/**
 *
 * @param {object} options options obj
 * @param {string} options.id entity id
 * @param {Entity[]} options.entities child entities in canonical rendering canonical ordering
 * @param {() => void} options.start lifecycle
 * @param {() => void} options.stop lifecycle
 * @param {() => void} options.sendToGameActor send event to game actor
 * @param {() => void} options.sendToGameMachine send event to game machine
 * @returns {SceneEntity} scene entity
 */
export const createScene = ({
	id,
	entities,
	start = noopFalseFunction,
	stop = noopFalseFunction,
	sendToGameActor,
	/* eslint-disable-next-line unused-imports/no-unused-vars */
	sendToGameMachine,
}) => {
	let isRunning = false;

	const scene = {
		id,

		start() {
			if(isRunning) {
				throw new Error("Cannot start in progress scene", this);
			}

			isRunning = true;

			for(const entity of entities) {
				entity.start();
			}

			start(this);

			sendToGameActor({ type : "START_SCENE", scene });
		},

		async load() {
			return Promise.all(
				entities
					.filter((entity) => entity.getSpriteRequests)
					.map(async (entity) => {
						const requests = entity.getSpriteRequests();
						const sprites = {};

						await Promise.all(
							Object.entries(requests).map(async ([ key, url ]) => {
								sprites[key] = createSprite([ await loadImageData(url) ]);
							}),
						);

						entity.setSprites(sprites);
					}),
			);
		},

		stop() {
			if(!isRunning) {
				throw new Error("Cannot stop stopped scene!", this);
			}

			isRunning = false;

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

		getRenderables() {
			const renderables = [];

			for(const entity of entities) {
				const renderable = entity.getRenderable();

				if(renderable) {
					renderables.push(renderable);
				}
			}

			return renderables;
		},
	};

	sendToGameActor({ type : "REGISTER_SCENE", scene });

	return scene;
};
