import { getStateNodes } from "xstate";

const CAMERA = "nissy-girl.nissygirl.camera";
const DEVICE = "nissy-girl.nissygirl.device";

// Ids of the active leaf states inside a region, e.g. "nissy-girl.nissygirl.camera.front".
const activeLeaves = (state, region = "") => {
	let leaves = "";

	for(const node of getStateNodes(state.machine.root, state.value)) {
		if(node.type === "atomic" && node.id.startsWith(region)) {
			leaves += `${node.id} `;
		}
	}

	return leaves;
};

const isSameState = (state, other) => {
	if(activeLeaves(state) !== activeLeaves(other)) {
		return false;
	}

	for(const key in state.context) {
		if(state.context[key] !== other.context[key]) {
			return false;
		}
	}

	return true;
};

// An unhandled event is a self-loop in xstate/graph, not an operation a user can
// complete. Such a step leaves both state and context unchanged.
const hasUnhandledStep = (path) => {
	for(let index = 1; index < path.steps.length; index++) {
		if(isSameState(path.steps[index].state, path.steps[index - 1].state)) {
			return true;
		}
	}

	return false;
};

/**
 * Selects the shortest path to each camera state, and to each device state per
 * inserted cartridge. The full parallel product is too large to run, and these
 * projections are the observable coverage that matters.
 * @param {Array} paths result of model.getShortestPaths
 * @returns {Set} selected paths; one path may cover both projections
 */
export const filterModelPaths = (paths) => {
	const shortest = new Map();

	for(const path of paths) {
		if(hasUnhandledStep(path)) {
			continue;
		}

		const keys = [
			`camera ${activeLeaves(path.state, CAMERA)}`,
			`device ${activeLeaves(path.state, DEVICE)} ${path.state.context.cartridge}`,
		];

		for(const key of keys) {
			const previous = shortest.get(key);

			if(!previous || path.steps.length < previous.steps.length) {
				shortest.set(key, path);
			}
		}
	}

	return new Set(shortest.values());
};
