import { noopFalseFunction } from "$util/noop.js";

import { Container, Assets, Sprite } from "pixi.js";

/**
 * @typedef {object} Entity
 * @property {() => void} start lifecycle
 * @property {() => void} stop lifecycle
 * @property {() => boolean} hasUpdate if should update
 * @property {() => void} update lifecycle
 * @property {() => void} render lifecycle
 * @property {() => Container} getRenderable get renderable for entity
 * @property {() => Record<string, string>} [getTextureRequests] optional: sprite key -> image url this entity needs
 * @property {(sprites: Record<string, Sprite>) => void} [setTextures] optional: receives loaded sprites, keyed the same as getSpriteRequests
 */

/**
 * @typedef {object} SceneEntity
 * @property {() => void} start lifecycle
 * @property {() => void} destroy lifecycle
 * @property {() => boolean} hasUpdate if should update
 * @property {() => void} update lifecycle
 * @property {() => void} stop pause
 * @property {() => Sprite[]} getRenderables get renderable for entity
 */

/**
 *
 * @param {object} options options obj
 * @param {string} options.id entity id
 * @param {Entity[]} options.entities child entities in canonical rendering canonical ordering
 * @param {() => void} options.start lifecycle
 * @param {() => void} options.stop lifecycle
 * @returns {SceneEntity} scene entity
 */
export const createScene = ({
	id,
	entities : entityFactories,
	start = noopFalseFunction,
	stop = noopFalseFunction,
}) => {
	let isRunning = false;

	const pixiScene = new Container();

	const entities = [];

	for(const createEntity of entityFactories) {
		const entity = createEntity();

		pixiScene.addChild(entity.getRenderable());

		entities.push(entity);
	}

	const entityMap = new Map(entities.map((entity) => [ entity.id, entity ]));

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
		},

		async load() {
			return Promise.all(
				entities
					.filter((entity) => entity.getTextureRequests)
					.map(async (entity) => {
						const requests = entity.getTextureRequests();
						const textures = {};

						await Promise.all(
							Object.entries(requests).map(async ([ key, url ]) => {
								textures[key] = await Assets.load(url);
							}),
						);

						entity.setTextures(textures);
					}),
			);
		},

		destroy() {
			for(const entity of entities) {
				entity.destroy();
			}

			pixiScene.destroy();
		},

		stop() {
			isRunning = false;

			for(const entity of entities) {
				entity.stop();
			}

			stop(this);
		},

		hasUpdate() {
			for(const entity of entities) {
				if(entity.hasUpdate(entityMap)) {
					return true;
				}
			}

			return false;
		},

		update(dt) {
			for(const entity of entities) {
				if(entity.hasUpdate(entityMap)) {
					entity.update(dt, entityMap);
				}
			}
		},

		render() {
			for(const entity of entities) {
				entity.render();
			}
		},

		getRenderables() {
			return pixiScene;
		},
	};

	return scene;
};
