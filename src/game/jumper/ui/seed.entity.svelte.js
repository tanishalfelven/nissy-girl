import { createInput, resolveDirectionX, resolveDirectionY } from "$game/shared/component/input.component.js";
import { createUINav } from "$game/shared/ui/ui-nav.component.svelte.js";
import { createEntity } from "$game/shared/entity/entity.js";
import { audio } from "$nissy-girl/sound/audio.js";

import { wrap } from "$util/math.js";

import { createTemporalWindow } from "$game/util/temporal.js";

export const createSeedUI = () => {
	const navComponent = createUINav({
		selectedNav : "seed",
		onNavigation : () => audio.jumper.playUIMove(),
	});

	const seed = $state([ 0, 0, 0, 0, 0, 0 ]);

	let increment = $state(false);
	let decrement = $state(false);

	let seedNav;
	let yHeldDir = 0;

	const fire = () => {
		if(!yHeldDir) {
			increment = false;
			decrement = false;
			repeatWindow.stop();

			return;
		}

		repeatWindow.start();

		if(!seedNav) {
			seedNav = navComponent.getNav("seed");
		}

		increment = yHeldDir > 0;
		decrement = yHeldDir < 0;

		audio.jumper.playUITick();

		seed[seedNav.active] = wrap(seed[seedNav.active] + yHeldDir, 0, 10);
	};

	// It's really awkward to recreate UI repeat inputs for a dpad direction
	// I am choosing to not infect ui navigation with this
	// A custom number input IS weird, choosing to keep the weird here
	// Not opposed to something that wraps this behavior better if it
	// becomes more commonly needed :)
	const repeatWindow = createTemporalWindow(150);

	const input = createInput({
		onInputChange(inputs) {
			const yHeldDirChange = -resolveDirectionY(inputs);

			if(yHeldDirChange !== yHeldDir) {
				yHeldDir = yHeldDirChange;

				fire();
			}

			navComponent.setDir(
				resolveDirectionX(inputs),
				0,
			);
		},
	});

	const model = {
		get seed() {
			return seed;
		},

		get increment() {
			return increment;
		},

		get decrement() {
			return decrement;
		},

		createNav(navOptions) {
			seedNav = navComponent.createNav(navOptions);

			return seedNav;
		},
	};

	return createEntity({
		id : "ui",
		components : {
			input,
			movement : navComponent,
			ui : {
				getModel() {
					return model;
				},

				hasUpdate() {
					return repeatWindow.active();
				},

				update(dt) {
					if(repeatWindow.update(dt)) {
						repeatWindow.start();
						fire();
					}
				},

				getSeed() {
					return seed.join("");
				},

				destroy() {
					navComponent.clearActiveNav();
				},
			},
		},
	});
};
