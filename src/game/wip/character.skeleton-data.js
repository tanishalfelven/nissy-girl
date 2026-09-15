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

	FACE_FRONT,
	FACE_REAR,
	FACE_LEFT,
	FACE_RIGHT,
} from "./skeleton/skeleton.consts.js";

const PIVOT_LEFT_ARMJOINT = { x : 0, y : 0 };
const PIVOT_LEFT_ARMBONE = { x : 3, y : 1 };
const PIVOT_LEFT_LEGJOINT = { x : 3, y : 1 };
const PIVOT_LEFT_LEGBONE = { x : 3, y : 1 };

const PIVOT_RIGHT_ARMJOINT = { x : 2, y : 0 };
const PIVOT_RIGHT_ARMBONE = { x : 1, y : 1 };
const PIVOT_RIGHT_LEGJOINT = { x : 3, y : 1 };
const PIVOT_RIGHT_LEGBONE = { x : 0, y : 1 };

export const characterSkeletonData = {
	id : "character",

	sourceTexture : characterSkeletonPng,
	sourceAtlasData : characterSkeletonAtlasData,

	data : {
		faces : {
			[FACE_FRONT] : {
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

			[FACE_REAR] : {
				[BONE_TORSO] : {
					pivot : { x : 3, y : 3 },
					display : true,
				},

				[JOINT_LEFTLEG] : {
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

				[JOINT_RIGHTLEG] : {
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

				[JOINT_LEFTARM] : {
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

				[JOINT_RIGHTARM] : {
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

			[FACE_LEFT] : {
				[BONE_TORSO] : {
					pivot : { x : 4, y : 3 },
					display : true,
				},

				[JOINT_LEFTLEG] : {
					pivot : PIVOT_LEFT_LEGJOINT,
					display : true,

					bones : {
						[BONE_HIP] : {
							display : true,
						},

						[BONE_LEG] : {
							pivot : PIVOT_LEFT_LEGBONE,
							display : true,
						},
					},
				},

				[JOINT_RIGHTLEG] : {
					pivot : PIVOT_LEFT_LEGJOINT,
					display : true,

					bones : {
						[BONE_HIP] : {
							display : true,
						},

						[BONE_LEG] : {
							pivot : PIVOT_LEFT_LEGBONE,
							display : true,
						},
					},
				},

				[JOINT_LEFTARM] : {
					pivot : PIVOT_LEFT_ARMJOINT,
					display : true,

					bones : {
						[BONE_SHOULDER] : {
							display : true,
						},

						[BONE_ARM] : {
							pivot : PIVOT_LEFT_ARMBONE,
							display : true,
						},
					},
				},

				// these are EXACTLY the same so this is fine
				[JOINT_RIGHTARM] : {
					pivot : PIVOT_LEFT_ARMJOINT,
					display : true,

					bones : {
						[BONE_SHOULDER] : {
							display : true,
						},

						[BONE_ARM] : {
							pivot : PIVOT_LEFT_ARMBONE,
							display : true,
						},
					},
				},

				[JOINT_HEAD] : {
					pivot : { x : 4, y : 8 },
					display : true,

					bones : {
						[BONE_HEAD] : {
							display : true,
						},

						[BONE_HAIR] : {
							pivot : { x : 1, y : 4 },
							display : true,
						},
					},
				},
			},

			[FACE_RIGHT] : {
				[BONE_TORSO] : {
					pivot : { x : 6, y : 3 },
					display : true,
				},

				[JOINT_LEFTLEG] : {
					pivot : PIVOT_RIGHT_LEGJOINT,
					display : true,

					bones : {
						[BONE_HIP] : {
							display : true,
						},

						[BONE_LEG] : {
							pivot : PIVOT_RIGHT_LEGBONE,
							display : true,
						},
					},
				},

				// inherit from LEFT face LEFT leg -
				[JOINT_RIGHTLEG] : {
					pivot : PIVOT_RIGHT_LEGJOINT,
					display : true,

					bones : {
						[BONE_HIP] : {
							display : true,
						},

						[BONE_LEG] : {
							pivot : PIVOT_RIGHT_LEGBONE,
							display : true,
						},
					},
				},

				[JOINT_LEFTARM] : {
					pivot : PIVOT_RIGHT_ARMJOINT,
					display : true,

					bones : {
						[BONE_SHOULDER] : {
							display : true,
						},

						[BONE_ARM] : {
							pivot : PIVOT_RIGHT_ARMBONE,
							display : true,
						},
					},
				},

				// these are EXACTLY the same so this is fine
				[JOINT_RIGHTARM] : {
					pivot : PIVOT_RIGHT_ARMJOINT,
					display : true,

					bones : {
						[BONE_SHOULDER] : {
							display : true,
						},

						[BONE_ARM] : {
							pivot : PIVOT_RIGHT_ARMBONE,
							display : true,
						},
					},
				},

				[JOINT_HEAD] : {
					pivot : { x : 4, y : 8 },
					display : true,

					bones : {
						[BONE_HEAD] : {
							display : true,
						},

						[BONE_HAIR] : {
							pivot : { x : 1, y : 3 },
							display : true,
						},
					},
				},
			},
		},
	},
};
