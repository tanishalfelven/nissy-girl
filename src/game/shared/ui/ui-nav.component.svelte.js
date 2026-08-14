import { createNav } from "./nav.svelte.js";
import { DIRECTION } from "../component/movement.js";

import { input } from "$nissy-girl/input.js";

import { FPS60 } from "$util/time.js";

const REPEAT_TIME = 150 / FPS60;

/** @import { WorldEntity } from "$src/game/shared/entity/world.entity.js" */

export const createUINavComponent = () => {
	const navs = new Map();
	let activeNav = false;

	const moveDir = new Set();

	const isMoving = () => moveDir.size > 0;

	let repeat = 0;

	return {
		createNav(options) {
			const nav = createNav(options);

			navs.set(options.id, nav);

			return nav;
		},

		setActiveNav(id) {
			activeNav = id;
		},

		clearActiveNav() {
			activeNav = false;
		},

		isMoving() {
			return isMoving();
		},

		hasUpdate() {
			return isMoving();
		},

		handleInput() {
			const dirCount = moveDir.size;

			for(const dir of DIRECTION.keys()) {
				if(input.state[dir]) {
					repeat = 0;

					moveDir.add(dir);
				} else if(!input.state[dir]) {
					moveDir.delete(dir);
				}
			}

			return moveDir.size !== dirCount
				|| isMoving();
		},

		stopInput() {
			moveDir.clear();
		},

		update(dt) {
			if(!isMoving()) {
				return false;
			}

			if(repeat >= REPEAT_TIME || repeat === 0) {
				repeat = 0;

				const activeNavigable = navs.get(activeNav);

				if(activeNavigable) {
					activeNavigable.handleInput(moveDir);
				}
			}

			repeat += dt;

			return true;
		},
	};
};
