import { createInput, resolveDirectionX, resolveDirectionY } from "$game/shared/component/input.component.js";
import { createUINav } from "$game/shared/ui/ui-nav.component.svelte.js";
import { createEntity } from "$game/shared/entity/entity.js";
import { audio } from "$nissy-girl/sound/audio.js";

export const createPaintUI = ({
	world,
} = false) => {
	const { camera } = world;
	const cursor = world.world.get("cursor");
	const artboard = world.world.get("artboard");

	const getActiveTool = () => cursor.tool.getTool();

	let isFixedCamera = $state(false);
	let scale = $state(1);

	let showPalette = $state(false);
	let showTools = $state(false);
	let cursorX = $state(cursor.movement.getX());
	let cursorY = $state(cursor.movement.getY());
	let toolActive = $state(false);
	let tool = $state(getActiveTool());
	let hasUndo = $state(artboard.artboard.getHasUndo());
	let selectedColor = $state(artboard.artboard.getContext().getColor());

	camera.onCameraChange(() => {
		scale = camera.getZoom();
		isFixedCamera = camera.getIsFixedStyle();
	});

	const navComponent = createUINav({
		onNavigation() {
			audio.paint.playNavOink();
		},
	});

	const input = createInput({
		onInputChange(inputs) {
			navComponent.setDir(
				resolveDirectionX(inputs),
				resolveDirectionY(inputs),
			);
		},
	});

	const setColor = (color) => {
		selectedColor = color;

		artboard.artboard.getContext().setColor(color);
	};

	const getNavColor = () => {
		const paletteNav = navComponent.getNav("palette");

		if(!paletteNav) {
			return false;
		}

		return paletteNav.active;
	};

	const getNavTool = () => {
		const toolNav = navComponent.getNav("tool");

		if(!toolNav) {
			return false;
		}

		return toolNav.active;
	};

	const model = {
		get showUI() {
			return !isFixedCamera || showPalette || showTools;
		},

		get showPalette() {
			return showPalette;
		},

		get showTools() {
			return showTools;
		},

		get scale() {
			return scale;
		},

		get toolActive() {
			return toolActive;
		},

		get tool() {
			return tool;
		},

		cursor : {
			get x() {
				return cursorX;
			},

			get y() {
				return cursorY;
			},
		},

		getColor() {
			return selectedColor;
		},

		createNav(navOptions) {
			// this indirection is meh
			const newNav = navComponent.createNav(navOptions);

			return newNav;
		},
	};

	return createEntity({
		id : "ui",
		components : {
			input,
			movement : navComponent,
			ui : {
				hasUpdate() {
					return camera.hasUpdate() || cursor.movement.isMoving();
				},

				update() {
					const { x, y } = camera.cameraToScreen(
						cursor.movement.getX(),
						cursor.movement.getY(),
					);

					cursorX = x;
					cursorY = y;

					toolActive = cursor.tool.active;
					tool = getActiveTool();
					hasUndo = artboard.artboard.getHasUndo();
				},

				getNavTool() {
					return getNavTool();
				},

				getActiveTool() {
					return tool;
				},

				getHasUndo() {
					return hasUndo;
				},

				getModel() {
					return model;
				},

				selectTool() {
					const navTool = getNavTool();

					if(!navTool) {
						return false;
					}

					cursor.tool.selectTool(navTool);
				},

				openPaletteMenu() {
					showPalette = true;
					navComponent.setActiveNav("palette");
				},

				closePaletteMenu({ saveColor = false } = false) {
					if(saveColor) {
						setColor(getNavColor());
					}

					showPalette = false;
					navComponent.clearActiveNav();
				},

				openToolsMenu() {
					const toolNav = navComponent.getNav("tool"); ;
					toolNav.setActive(getActiveTool());

					navComponent.setActiveNav("tool");

					showTools = true;
				},

				closeToolsMenu() {
					navComponent.clearActiveNav();

					showTools = false;
				},
			},
		},
	});
};
