import { createInput, resolveDirectionX, resolveDirectionY } from "$game/shared/component/input.component.js";
import { createUINav } from "$game/shared/ui/ui-nav.component.svelte.js";
import { createEntity } from "$game/shared/entity/entity.js";

export const createJumperUI = ({
	world,
}) => {
	const navComponent = createUINav();

	const input = createInput({
		onInputChange(inputs) {
			navComponent.setDir(
				resolveDirectionX(inputs),
				resolveDirectionY(inputs),
			);
		},
	});

	const model = {
		createNav(navOptions) {
			const newNav = navComponent.createNav(navOptions);

			return newNav;
		},

		startGame : () => world.world.notifyGame({ type : "START_PLAY" }),
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

				getModel() {
					return model;
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
