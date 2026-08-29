import { createInput, resolveDirectionX, resolveDirectionY } from "$game/shared/component/input.component.js";
import { createUINav } from "$game/shared/ui/ui-nav.component.svelte.js";
import { createEntity } from "$game/shared/entity/entity.js";
import { toString, MINUTE_MS } from "$util/time-string.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "$nissy-girl/screens/screen.consts.js";

const WORST_TIME = MINUTE_MS * 7;

const calculateScore = (elapsedTime, coins) => {
	const coinBonus = coins * 300;
	const achievement = Math.max(WORST_TIME - elapsedTime, 0) / WORST_TIME;

	return coinBonus + Math.floor(achievement * 10000);
};

export const createJumperUI = ({
	world,
}) => {
	const navComponent = createUINav();

	let isPlaying = $state(false);
	let startTime = $state(false);
	let elapsedTime = $state(0);
	let collectedCoins = $state(0);
	let maxCoins = $state(0);
	let score = $state(0);

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

		get score() {
			return score;
		},

		displayTime() {
			return elapsedTime !== 0;
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

					if(isPlaying) {
						elapsedTime = performance.now() - startTime;
					}
				},

				getModel() {
					return model;
				},

				stopPlay() {
					isPlaying = false;
					// store off final time
					elapsedTime = performance.now() - startTime;

					startTime = false;
					score = calculateScore(elapsedTime, collectedCoins);

					// keep coins around, we still need em

					const jumper = world.world.get("jumper");

					jumper.render.finishGame();
					navComponent.setActiveNav("score");

					world.camera.animateTo({
						x : CANVAS_WIDTH / 2,
						y : jumper.movement.getY() - (CANVAS_HEIGHT * 0.33),
						duration : 300,
					});
				},

				exitPlay() {
					navComponent.clearActiveNav();
					startTime = false;
					elapsedTime = 0;
					collectedCoins = 0;
					maxCoins = 0;
					score = 0;
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

				getScoreOption() {
					const scoreNav = navComponent.getNav("score");

					if(!scoreNav) {
						return false;
					}

					return scoreNav.active;
				},
			},
		},
	});
};
