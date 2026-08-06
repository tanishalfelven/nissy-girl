import { noopFalseFunction } from "$util/noop.js";

import { Assets } from "pixi.js";

/** @import { Entity } from "./entity.js" */
/** @import { WorldEntity } from "./world.entity.js" */

/**
 * @typedef {object} SceneEntity
 * @property {() => void} start lifecycle
 * @property {() => void} destroy lifecycle
 * @property {() => boolean} hasUpdate if should update
 * @property {() => void} update lifecycle
 * @property {() => void} stop pause
 * @property {() => void} render pause
 * @property {WorldEntity} world
 */

/**
 *
 * @param {object} options options obj
 * @param {string} options.id entity id
 * @param {() => WorldEntity} options.world
 * @param {(() => Entity)[]} options.entities child entities in canonical rendering canonical ordering
 * @param {() => void} options.start lifecycle
 * @param {() => void} options.stop lifecycle
 * @returns {SceneEntity} scene entity
 */
export const createScene = ({
	id,
	world : worldFactory,
	entities : entityFactories,
	start = noopFalseFunction,
	stop = noopFalseFunction,
}) => {
	let isRunning = false;

	const world = worldFactory();
	const entities = [ world ];

	for(const createEntity of entityFactories) {
		const entity = createEntity(world);

		world.registerEntity(entity);

		entities.push(entity);
	}

	const scene = {
		id,

		world,

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

		render() {
			for(const entity of entities) {
				entity.render();
			}
		},
	};

	return scene;
};
