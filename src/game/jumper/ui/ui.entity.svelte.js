import { createInput, resolveDirectionX, resolveDirectionY } from "$game/shared/component/input.component.js";
import { createUINav } from "$game/shared/ui/ui-nav.component.svelte.js";
import { createEntity } from "$game/shared/entity/entity.js";
import { toString } from "$util/time-string.js";

export const createJumperUI = ({
	world,
}) => {
	const navComponent = createUINav();

	let isPlaying = $state(false);
	let startTime = $state(false);
	let elapsedTime = $state(0);
	let collectedCoins = $state(0);
	let maxCoins = $state(0);

	const input = createInput({
		onInputChange(inputs) {
			navComponent.setDir(
				resolveDirectionX(inputs),
				resolveDirectionY(inputs),
			);
		},
	});

	const model = {
		get isPlaying() {
			return isPlaying;
		},

		get elapsedTime() {
			return toString(elapsedTime);
		},

		get collectedCoins() {
			return collectedCoins;
		},

		get maxCoins() {
			return maxCoins;
		},

		createNav(navOptions) {
			const newNav = navComponent.createNav(navOptions);

			return newNav;
		},

		startGame : () => {
			isPlaying = true;
			startTime = performance.now();
			world.world.notifyGame({ type : "START_PLAY" });
		},
	};

	return createEntity({
		id : "ui",
		components : {
			input,
			movement : navComponent,
			ui : {
				async load() {
					await document.fonts.load("16px Pixelzone");
				},

				collectCoin() {
					collectedCoins++;
				},

				update() {
					if(maxCoins === 0) {
						maxCoins = world.world.get("coins").coins.getMaxCoins();
					}

					if(startTime !== false) {
						elapsedTime = performance.now() - startTime;
					}
				},

				getModel() {
					return model;
				},

				stopPlay() {
					startTime = false;
					elapsedTime = 0;
					isPlaying = false;
					collectedCoins = 0;
					maxCoins = 0;
				},

				openPauseMenu() {
					navComponent.setActiveNav("paused");
				},

				closePauseMenu() {
					navComponent.clearActiveNav();
				},

				getPausedOption() {
					const pausedNav = navComponent.getNav("paused");

					if(!pausedNav) {
						return false;
					}

					return pausedNav.active;
				},
			},
		},
	});
};
