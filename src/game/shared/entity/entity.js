/**
 * @typedef {object} Component
 * @property {() => void} start
 * @property {() => void} stop
 * @property {() => void} update
 * @property {() => void} handleInput
 */

/**
 * @typedef {object} Entity
 * @property {boolean} hasComponent
 * @property {Component} getComponent
 */

/**
 *
 * @param {object} options
 * @param {string} options.id
 * @param {object} options.components
 * @returns {Entity}
 */
export const createEntity = ({ id, components = {} }) => {
	// TODO validate components to scene
	const componentMap = new Map(Object.entries(components));

	const entity = ({
		id,
		components,
		getComponents() {
			return componentMap;
		},
		hasComponent(id) {
			return componentMap.has(id);
		},
		getComponent(id) {
			return componentMap.get(id);
		},
	});

	for(const [ id, component ] of componentMap) {
		entity[id] = component;
	}

	return entity;
};
