import { createWorld } from "./world.entity.js";

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

const createUnrolledCallableByLifecycle = (components, entities, lifecycles) => {
	const lifecycleMap = new Map(
		lifecycles.map(
			(lifecycle) => [ lifecycle, []],
		),
	);

	// trying to only do this insane loop once
	for(const component of components) {
		for(const entity of entities) {
			const entityComponents = entity.getComponents();

			for(const lifecycle of lifecycles) {
				if(entityComponents.get(component)?.[lifecycle]) {
					lifecycleMap.get(lifecycle).push([ entity, entity[component][lifecycle] ]);
				}
			}
		}
	}

	return lifecycleMap;
};

/**
 *
 * @param {object} options options obj
 * @param {string} options.id entity id
 * @param {() => WorldEntity} options.world
 * @param {(() => Entity)[]} options.entities child entities in canonical rendering canonical ordering
 * @param {string[]} options.componentOrder
 * @returns {SceneEntity} scene entity
 */
export const createScene = ({
	id,
	world : worldFactory = createWorld,
	entities : entityFactories,
	componentOrder,
}) => {
	const world = worldFactory();
	const entities = [ world ];

	let isAlive = true;

	for(const createEntity of entityFactories) {
		const entity = createEntity({ world });

		world.world.add(entity);

		entities.push(entity);
	}

	const lifecycleMap = createUnrolledCallableByLifecycle(
		componentOrder,
		entities,
		[
			"load",
			"destroy",
			"stop",
			"hasUpdate",
			"update",
		],
	);

	// set calls upfront so iteration has as few lookups as possible
	const load = lifecycleMap.get("load").map(([ , loadFunc ]) => loadFunc);
	const hasUpdate = lifecycleMap.get("hasUpdate").map(([ , hasUpdateFunc ]) => hasUpdateFunc);
	const update = lifecycleMap.get("update");
	const stop = lifecycleMap.get("stop").map(([ , stopFunc ]) => stopFunc);
	const destroy = lifecycleMap.get("destroy").map(([ , destroyFunc ]) => destroyFunc);
	// We clearly aren't really ECS but we're going to try and model that direction with room to grow!

	const scene = {
		id,
		world,

		// scene-action caches the scene while it's alive, expose lifecycle so it knows to get rid of us
		get isAlive() {
			return isAlive;
		},

		async load() {
			return Promise.all(
				load.map((loadFunc) => loadFunc()),
			);
		},

		hasUpdate() {
			for(const hasUpdateFunc of hasUpdate) {
				if(!isAlive) {
					return;
				}

				if(hasUpdateFunc()) {
					return true;
				}
			}

			return false;
		},

		update(dt) {
			for(const [ entity, updateFunc ] of update) {
				if(!isAlive) {
					return;
				}

				updateFunc(dt, entity);
			}
		},

		// stop is maybe not semantically making sense so far
		stop() {
			for(const stopFunc of stop) {
				stopFunc();
			}
		},

		destroy() {
			for(const destroyFunc of destroy) {
				destroyFunc();
			}

			isAlive = false;
		},
	};

	return scene;
};
