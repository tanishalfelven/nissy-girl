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

const lifecycleOrder = [
	"load",
	"destroy",
	"stop",
	"hasUpdate",
	"update",
];

/**
 *
 * @param {object} options options obj
 * @param {string} options.id entity id
 * @param {() => WorldEntity} options.world
 * @param {(() => Entity)[]} options.entities child entities in canonical rendering canonical ordering
 * @param {string[]} options.simulateOrder
 * @param {string[]} options.frameOrder
 * @returns {SceneEntity} scene entity
 */
export const createScene = ({
	id,
	world : worldFactory = createWorld,
	entities : entityFactories,
	simulateOrder = [],
	frameOrder = [],
}) => {
	const world = worldFactory();
	const entities = [ world ];

	let isAlive = true;

	for(const createEntity of entityFactories) {
		const entity = createEntity({ world });

		world.world.add(entity);

		entities.push(entity);
	}

	const simulateMap = createUnrolledCallableByLifecycle(
		simulateOrder,
		entities,
		lifecycleOrder,
	);

	const frameMap = createUnrolledCallableByLifecycle(
		frameOrder,
		entities,
		lifecycleOrder,
	);

	// set calls upfront so iteration has as few lookups as possible
	// simulated and frame components share some lifecycle - load/stop/destroy
	const load = [
		...simulateMap.get("load").map(([ , loadFunc ]) => loadFunc),
		...frameMap.get("load").map(([ , loadFunc ]) => loadFunc),
	];
	const stop = [
		...simulateMap.get("stop").map(([ , stopFunc ]) => stopFunc),
		...frameMap.get("stop").map(([ , stopFunc ]) => stopFunc),
	];
	const destroy = [
		...simulateMap.get("destroy").map(([ , destroyFunc ]) => destroyFunc),
		...frameMap.get("destroy").map(([ , destroyFunc ]) => destroyFunc),
	];
	const simulateHasUpdate = simulateMap.get("hasUpdate").map(([ , hasUpdateFunc ]) => hasUpdateFunc);
	const simulateUpdate = simulateMap.get("update");
	// ! frame lifecycle doesn't respect hasUpdate, if simulate proposes a frame, frame occurs
	const frameUpdate = frameMap.get("update");
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
			for(const hasUpdateFunc of simulateHasUpdate) {
				if(!isAlive) {
					return;
				}

				if(hasUpdateFunc()) {
					return true;
				}
			}

			return false;
		},

		simulate() {
			for(const [ entity, updateFunc ] of simulateUpdate) {
				if(!isAlive) {
					return;
				}

				updateFunc(entity);
			}
		},

		frame(dt) {
			for(const [ entity, updateFunc ] of frameUpdate) {
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
