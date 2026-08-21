import { Container } from "pixi.js";

import { createEntity } from "./entity.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "$nissy-girl/screens/screen.consts.js";

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
 * @param {object} options
 * @param {number} options.width
 * @param {number} options.height
 * @returns {ContainerComponent}
 */
const createContainerComponent = ({
	width,
	height,
}) => {
	const entities = [];
	const entityMap = new Map();
	const surface = new Container();

	const isInBounds = (x, y) => x >= 0 && x <= (width - 1) && y >= 0 && y <= (height - 1);

	let notifyGame = false;

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

		getBounds() {
			return { width, height };
		},

		inject(newNotifyGame) {
			notifyGame = newNotifyGame;
		},

		notifyGame : (data) => {
			if(notifyGame) {
				notifyGame(data);
			}
		},

		isInBounds,

		get(entityId) {
			return entityMap.get(entityId);
		},

		// remove(){} > no removal for the moment

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
 * @param {number} [options.width]
 * @param {number} [options.height]
 * @returns {Entity}
 */
export const createWorld = ({
	id = "world",
	width = CANVAS_WIDTH,
	height = CANVAS_HEIGHT,
	components = {},
} = false) => {
	const worldEntity = createEntity({
		id,
		components : {
			world : createContainerComponent({ width, height }),
		},
	});

	// world is specifically weird - since most components need access to the world we
	// use entity component addition and then factory components in with the world
	const componentMap = new Map(Object.entries(components));

	for(const [ id, component ] of componentMap) {
		worldEntity.addComponent(id, () => component({ world : worldEntity }));
	}

	return worldEntity;
};
