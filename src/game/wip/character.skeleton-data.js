import CharacterSkeletonPng from "./assets/character-skeleton.png";
import CharacterSkeletonAtlasData from "./assets/character-skeleton.json?aseprite-packed-atlas";

import {
	BONE_TORSO,
	BONE_LEFTHIP,
	BONE_RIGHTHIP,
	BONE_LEFTLEG,
	BONE_RIGHTLEG,
	BONE_HEAD,
	BONE_HAIR,
	BONE_LEFTSHOULDER,
	BONE_RIGHTSHOULDER,
	BONE_LEFTARM,
	BONE_RIGHTARM,
	LAYER_BEHIND,
	LAYER_ABOVE,
} from "./skeleton.consts.js";

export const characterSkeletonData = {
	id : "character",

	sourceTexture : CharacterSkeletonPng,
	sourceAtlasData : CharacterSkeletonAtlasData,

	faces : [
		{
			id : "front",
			bones : [
				{
					id : BONE_TORSO,
					position : { x : 6, y : 13 },
					pivot : { x : 4, y : 3 },
					layer : LAYER_ABOVE,
					display : true,
				},

				{
					id : BONE_LEFTHIP,
					position : { x : 7, y : 5 },
					pivot : { x : 2, y : 1 },
					parent : BONE_TORSO,
					layer : LAYER_BEHIND,
					display : true,
				},
				{
					id : BONE_LEFTLEG,
					position : { x : 0, y : 3 },
					pivot : { x : 0, y : 0 },
					parent : BONE_LEFTHIP,
					layer : LAYER_ABOVE,
					display : true,
				},

				{
					id : BONE_RIGHTHIP,
					position : { x : 0, y : 5 },
					pivot : { x : 1, y : 1 },
					parent : BONE_TORSO,
					layer : LAYER_BEHIND,
					display : true,
				},
				{
					id : BONE_RIGHTLEG,
					position : { x : 4, y : 3 },
					pivot : { x : 3, y : 0 },
					parent : BONE_RIGHTHIP,
					layer : LAYER_ABOVE,
					display : true,
				},

				{
					id : BONE_LEFTSHOULDER,
					position : { x : 8, y : 0 },
					pivot : { x : 2, y : 1 },
					parent : BONE_TORSO,
					layer : LAYER_ABOVE,
					display : true,
				},
				{
					id : BONE_LEFTARM,
					position : { x : 1, y : 2 },
					pivot : { x : 0, y : 0 },
					parent : BONE_LEFTSHOULDER,
					layer : LAYER_ABOVE,
					display : true,
				},

				{
					id : BONE_RIGHTSHOULDER,
					position : { x : -1, y : 0 },
					pivot : { x : 0, y : 1 },
					parent : BONE_TORSO,
					layer : LAYER_ABOVE,
					display : true,
				},
				{
					id : BONE_RIGHTARM,
					position : { x : 1, y : 2 },
					pivot : { x : 1, y : 0 },
					parent : BONE_RIGHTSHOULDER,
					layer : LAYER_ABOVE,
					display : true,
				},

				{
					id : BONE_HEAD,
					position : { x : 5, y : 4 },
					pivot : { x : 5, y : 3 },
					layer : LAYER_ABOVE,
					display : true,
				},
				{
					id : BONE_HAIR,
					position : { x : 2, y : 5 },
					pivot : { x : 0, y : 4 },
					layer : LAYER_ABOVE,
					display : true,
				},
			],
		},
	],
};
