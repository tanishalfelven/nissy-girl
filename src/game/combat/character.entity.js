import { createSkeleton } from "$game/util/skeleton/skeleton.component.js";
import { createSkeletonResolver } from "$game/util/skeleton/resolvers/skeleton.resolvers.js";
import { characterSkeletonData } from "./character.skeleton-data.js";

import { createInput } from "$game/shared/component/input.component.js";

import { createEntity } from "$game/shared/entity/entity.js";

import { Container } from "pixi.js";
import { ANIMID_RUN, createRunAnimation } from "./character.animations.js";

import { DPAD_DOWN, DPAD_RIGHT, DPAD_LEFT, DPAD_UP } from "$game/shared/input.consts.js";
import { createAnimator } from "$game/util/skeleton/skeleton.animator.js";

export const createCharacter = () => {
	const characterSkeleton = createSkeleton({
		skeletonData : characterSkeletonData,
		createResolver : createSkeletonResolver,
	});

	const character = new Container({
		x : 50,
		y : 50,
		children : [
			characterSkeleton.container,
		],
	});

	// ! this should be owned by the skeleton directly
	const animator = createAnimator(
		characterSkeleton,
		[
			createRunAnimation,
		],
	);

	const input = createInput({
		onInputChange(inputs) {
			let leftIntent = inputs.has(DPAD_LEFT);
			let downIntent = inputs.has(DPAD_DOWN);
			let rightIntent = inputs.has(DPAD_RIGHT);
			let upIntent = inputs.has(DPAD_UP);

			if(inputs.size) {
				if(!animator.isActive(ANIMID_RUN)) {
					animator.start(ANIMID_RUN);
				}

				if(leftIntent) {
					characterSkeleton.setFace("left");
				}

				if(downIntent) {
					characterSkeleton.setFace("front");
				}

				if(rightIntent) {
					characterSkeleton.setFace("right");
				}

				if(upIntent) {
					characterSkeleton.setFace("rear");
				}
			} else {
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
