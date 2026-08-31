import { createNav } from "./nav.svelte.js";

import { FPS60 } from "$util/time.js";

import { createDirection } from "../component/direction.js";

const REPEAT_TIME = 150 / FPS60;

/** @import { WorldEntity } from "$src/game/shared/entity/world.entity.js" */

export const createUINav = ({ selectedNav = false } = false) => {
	const dir = createDirection();
	const navs = new Map();

	let activeNav = selectedNav;
	let repeat = 0;

	return {
		isMoving : dir.isMoving,

		hasUpdate : dir.isMoving,

		setDir : (xDir, yDir) => {
			const changed = dir.set(xDir, yDir);

			if(changed) {
				repeat = 0;
			}
		},

		createNav(options) {
			const nav = createNav(options);

			navs.set(options.id, nav);

			return nav;
		},

		getNav(id) {
			return navs.get(id);
		},

		setActiveNav(id) {
			activeNav = id;
		},

		clearActiveNav() {
			activeNav = false;
		},

		update(dt) {
			if(!dir.isMoving()) {
				return false;
			}

			if(repeat >= REPEAT_TIME || repeat === 0) {
				repeat = 0;

				const activeNavigable = navs.get(activeNav);

				if(activeNavigable) {
					activeNavigable.stepDirection(dir.getX(), dir.getY());
				}
			}

			repeat += dt;

			return true;
		},
	};
};
