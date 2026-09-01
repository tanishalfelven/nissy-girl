import { createNav } from "./nav.svelte.js";

import { FPS60 } from "$util/time.js";

import { createDirection } from "../component/direction.js";
import { noopFalseFunction } from "$util/noop.js";

const REPEAT_TIME = 150 / FPS60;

const INVALID_NAV = new Set([ undefined, false ]);

/** @import { WorldEntity } from "$src/game/shared/entity/world.entity.js" */

export const createUINav = ({ selectedNav = false, onNavigation = noopFalseFunction } = false) => {
	const dir = createDirection();
	const navs = new Map();

	let prevActiveOption = $state(false);
	let activeNavRef = $state(false);

	const cleanup = $effect.root(() => {
		$effect(() => {
			if(activeNavRef
				&& !INVALID_NAV.has(prevActiveOption)
				&& activeNavRef.active !== prevActiveOption) {
				onNavigation();
			}

			prevActiveOption = activeNavRef.active;
		});
	});

	let activeNav = selectedNav;
	let repeat = 0;

	return {
		isMoving : dir.isMoving,

		hasUpdate : dir.isMoving,

		get activeNav() {
			return activeNavRef;
		},

		destroy() {
			cleanup();
		},

		setDir : (xDir, yDir) => {
			const changed = dir.set(xDir, yDir);

			if(changed) {
				repeat = 0;
			}
		},

		createNav(options) {
			const nav = createNav(options);

			navs.set(options.id, nav);

			if(options.id === activeNav) {
				activeNavRef = nav;
			}

			return nav;
		},

		getNav(id) {
			return navs.get(id);
		},

		setActiveNav(id) {
			activeNav = id;
			prevActiveOption = false;

			if(navs.has(activeNav)) {
				activeNavRef = navs.get(activeNav);
				prevActiveOption = activeNavRef.active;
			}
		},

		clearActiveNav() {
			activeNav = false;

			activeNavRef = false;
			prevActiveOption = false;
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
