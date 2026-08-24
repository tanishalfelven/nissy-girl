import { Assets, Spritesheet } from "pixi.js";

// I hate that this is necessary but we need the textures to exist to map frame timings onto them.

// Note - I find pixi struggles sometimes with these, adding 1 to padding/spacing/border seems to help

/**
 *
 * @param {string} spriteSheetPng resolved image path
 * @param {object} spriteSheetData resolved vite plugin spritesheet animation (using vite-plugin-aseprite-animation)
 * @returns {object} object of named animations with textures and frame speed from aseprite inserted
 */
export const getAnimations = async (spriteSheetPng, spriteSheetData) => {
	const spriteAsset = await Assets.load({
		src : spriteSheetPng,
	});

	const spritesheet = new Spritesheet({
		texture : spriteAsset,
		data : spriteSheetData,
	});

	await spritesheet.parse();

	return spriteSheetData.frameData.reduce(
		(animations, frame) => {
			if(!animations[frame.name]) {
				animations[frame.name] = [];
			}

			// take frame index, map spritesheet animation texture in instead of the reference
			animations[frame.name].push({
				texture : spritesheet.textures[frame.texture],
				time : frame.time,
			});

			return animations;
		},
		{
			destroy : () => {
				spriteAsset.destroy();
				spritesheet.destroy();
			},
		},
	);
};
