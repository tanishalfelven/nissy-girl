import { Container } from "pixi.js";

import { createEntity } from "./entity.js";

/** @import { Entity } from "./entity.js" */

/**
 * @typedef {object} Component
 * @property {() => void} [update]
 * @property {() => void} [start]
 * @property {() => void} [stop]
 * @property {() => void} [destroy]
 */

/**
 * @typedef {object} ContainerComponent
 * @property {(Entity) => void} add
 * \@property {() => void} remove
 * @property {() => Container} getRenderable
 * @property {() => void} destroy
 */

/**
 * @returns {ContainerComponent}
 */
const createContainerComponent = () => {
	const entities = [];
	const entityMap = new Map();
	const surface = new Container();

	return ({
		add(entity) {
			entities.push(entity);
			entityMap.set(entity.id, entity);

			if(entity?.render?.getRenderable) {
				surface.addChild(entity.render.getRenderable());
			}

			// components get a special reference to their world component!
			entity.world = this;
		},

		get(entityId) {
			return entityMap.get(entityId);
		},

		// ??? no removal for the moment
		getRenderable() {
			return surface;
		},
		destroy() {
			surface.destroy();
		},
	});
};

/**
 * @param {object} [options]
 * @param {string} options.id
 * @param {object} options.components
 * @returns {Entity}
 */
export const createWorld = ({
	id = "world",
	components = {},
} = false) => {
	const worldEntity = createEntity({
		id,
		components : {
			world : createContainerComponent(),
			...components,
		},
	});

	return worldEntity;
};
