import { Assets, Spritesheet } from "pixi.js";

export const getAtlas = async (spriteSheetPng, spriteSheetData) => {
	const spriteAsset = await Assets.load({
		src : spriteSheetPng,
	});

	const spritesheet = new Spritesheet({
		texture : spriteAsset,
		data : spriteSheetData,
	});

	await spritesheet.parse();

	return spritesheet;
};
