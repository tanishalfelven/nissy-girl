import characterSkeletonPng from "./assets/character-skeleton.png";
import characterSkeletonAtlasData from "./assets/character-skeleton.json?aseprite-skeleton-atlas";

import {
	JOINT_LEFTLEG,
	JOINT_LEFTARM,
	BONE_HIP,
	BONE_LEG,

	JOINT_RIGHTLEG,
	JOINT_RIGHTARM,
	BONE_SHOULDER,
	BONE_ARM,

	BONE_TORSO,

	JOINT_HEAD,
	BONE_HEAD,
	BONE_HAIR,
} from "./skeleton.consts.js";

export const characterSkeletonData = {
	id : "character",

	sourceTexture : characterSkeletonPng,
	sourceAtlasData : characterSkeletonAtlasData,

	data : {
		faces : {
			front : {
				[BONE_TORSO] : {
					pivot : { x : 3, y : 3 },
					display : true,
				},

				[JOINT_LEFTLEG] : {
					pivot : { x : 2, y : 1 },
					display : true,

					bones : {
						[BONE_HIP] : {
							display : true,
						},

						[BONE_LEG] : {
							pivot : { x : 0, y : 0 },
							display : true,
						},
					},
				},

				[JOINT_RIGHTLEG] : {
					pivot : { x : 1, y : 1 },
					display : true,

					bones : {
						[BONE_HIP] : {
							display : true,
						},

						[BONE_LEG] : {
							pivot : { x : 3, y : 0 },
							display : true,
						},
					},
				},

				[JOINT_LEFTARM] : {
					pivot : { x : 0, y : 1 },
					display : true,

					bones : {
						[BONE_SHOULDER] : {
							display : true,
						},

						[BONE_ARM] : {
							pivot : { x : 0, y : 0 },
							display : true,
						},
					},
				},

				[JOINT_RIGHTARM] : {
					pivot : { x : 2, y : 1 },
					display : true,

					bones : {
						[BONE_SHOULDER] : {
							display : true,
						},

						[BONE_ARM] : {
							pivot : { x : 1, y : 0 },
							display : true,
						},
					},
				},

				[JOINT_HEAD] : {
					pivot : { x : 5, y : 3 },
					display : true,

					bones : {
						[BONE_HEAD] : {
							display : true,
						},

						[BONE_HAIR] : {
							pivot : { x : 0, y : 4 },
							display : true,
						},
					},
				},
			},
		},
	},
};
