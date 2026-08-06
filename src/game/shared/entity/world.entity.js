import { Container } from "pixi.js";

/** @import { Entity } from "./entity.js" */

/**
 * @typedef {object} WorldEntity
 * @property {() => void} start lifecycle
 * @property {() => void} destroy lifecycle
 * @property {() => boolean} hasUpdate if should update
 * @property {() => void} update lifecycle
 * @property {() => void} stop pause
 * @property {() => Container} getRenderable get renderable for entity
 * @property {(Entity) => void} registerEntity register entity to world
 */

/**
 * @param {object} [options]
 * @param {string} options.id
 * @param {number} options.width
 * @param {number} options.height
 * @returns {WorldEntity}
 */
export const createWorld = ({
	id,
	// todo
	width = 1,
	height = 1,
} = false) => {
	const surface = new Container();

	const entities = [];

	return {
		id,

		start() {},

		registerEntity(entity) {
			entities.push(entity);

			surface.addChild(entity.getRenderable());
		},

		// this may be antipattern
		getEntities() {
			return entities;
		},

		hasUpdate() {
			return false;
		},

		update() {},

		render() {},

		getRenderable() {
			return surface;
		},

		stop() {},

		destroy() {
			surface.destroy();
		},
	};
};
