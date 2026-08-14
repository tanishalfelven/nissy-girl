import { NOZOOM_FIXED } from "$game/shared/component/camera.js";

import { createUINavComponent } from "$game/shared/ui/ui-nav.component.svelte.js";
import { createEntity } from "$game/shared/entity/entity.js";

export const createPaintUI = ({
	world,
} = false) => {
	const { camera } = world;

	let showUI = $state(false);
	let showPalette = $state(false);
	let showTools = $state(false);

	let paletteNav = false;

	const navComponent = createUINavComponent();

	const model = {
		get showUI() {
			return showUI || showPalette || showTools;
		},

		get showPalette() {
			return showPalette;
		},

		get showTools() {
			return showTools;
		},

		get selectedColor() {
			return paletteNav.active;
		},

		getColor() {
			const artboard = world.world.get("artboard");

			return artboard.artboard.getContext().getColor();
		},

		setColor(color) {
			const artboard = world.world.get("artboard");

			return artboard.artboard.getContext().setColor(color);
		},

		createNav(navOptions) {
			// this indirection is meh
			const newNav = navComponent.createNav(navOptions);

			if(navOptions.id === "palette") {
				paletteNav = newNav;
			}

			return newNav;
		},
	};

	return createEntity({
		id : "ui",
		components : {
			movement : navComponent,
			ui : {
				hasUpdate() {
					return camera.hasUpdate();
				},

				update() {
					showUI = camera.getZoomType() !== NOZOOM_FIXED;
				},

				getModel() {
					return model;
				},

				openPaletteMenu() {
					showPalette = true;
				},

				closePaletteMenu() {
					showPalette = false;
				},

				openToolsMenu() {
					showTools = true;
				},

				closeToolsMenu() {
					showTools = false;
				},
			},
		},
	});
};
