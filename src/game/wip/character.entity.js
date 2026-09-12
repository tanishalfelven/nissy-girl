import { createSkeleton } from "./skeleton.component.js";
import { createFrontFacingResolver } from "./skeleton.resolvers.js";
import { characterSkeletonData } from "./character.skeleton-data.js";

import { createInput } from "$game/shared/component/input.component.js";

import { createEntity } from "$game/shared/entity/entity.js";

import { Container, Graphics } from "pixi.js";
import { COLOR_BLACK, COLOR_BROWN, COLOR_WHITE } from "$nissy-girl/screens/render.consts.js";
import { ANIMID_RUN, createRunAnimation } from "./character.animations.js";

import { DPAD_DOWN } from "$game/shared/input.consts.js";
import { createAnimator } from "./animator.js";

export const createCharacter = () => {
	const characterSkeleton = createSkeleton(
		characterSkeletonData,
		// this needs to somehow map to skeleton facing ids (that projection key should live somewhere)
		createFrontFacingResolver,
	);

	const { head } = characterSkeleton.faces.front.bones;

	const eyes = new Graphics();
	const pupils = new Graphics();

	eyes.rect(3, 7, 2, 1).fill(COLOR_WHITE);
	eyes.rect(3, 6, 2, 1).fill(COLOR_BROWN);
	eyes.rect(7, 7, 2, 1).fill(COLOR_WHITE);
	eyes.rect(7, 6, 2, 1).fill(COLOR_BROWN);
	pupils.rect(4, 7, 1, 1).fill(COLOR_BLACK);
	pupils.rect(7, 7, 1, 1).fill(COLOR_BLACK);

	head.node.addChild(eyes, pupils);

	const character = new Container({
		x : 50,
		y : 50,
		children : [
			characterSkeleton.container,
		],
	});

	const animator = createAnimator(
		characterSkeleton,
		[
			createRunAnimation,
		],
	);

	let downIntent = false;

	const input = createInput({
		onInputChange(inputs) {
			downIntent = inputs.has(DPAD_DOWN);

			if(downIntent && !animator.isActive(ANIMID_RUN)) {
				animator.start(ANIMID_RUN);
			} else if(!downIntent && animator.isActive(ANIMID_RUN)) {
				animator.stop();
			}
		},
	});

	return createEntity({
		id : "character",
		components : {
			input,
			render : {
				async load() {
					await characterSkeleton.load();
				},

				hasUpdate() {
					return true;
				},

				update(dt) {
					animator.update(dt);
				},

				getRenderable() {
					return character;
				},

				destroy() {
					characterSkeleton.destroy();
				},
			},
		},
	});
};
