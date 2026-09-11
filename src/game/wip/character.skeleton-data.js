import LeftHipPng from "./assets/lefthip.png";
import LeftLegPng from "./assets/leftleg.png";
import RightHipPng from "./assets/righthip.png";
import RightLegPng from "./assets/rightleg.png";
import HeadPng from "./assets/head.png";
import HairPng from "./assets/hair.png";
import TorsoPng from "./assets/torso.png";
import LeftShoulderPng from "./assets/leftshoulder.png";
import RightShoulderPng from "./assets/rightshoulder.png";
import LeftArmPng from "./assets/leftarm.png";
import RightArmPng from "./assets/rightarm.png";

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
	BONE_RIGHTARM, LAYER_BEHIND,
	LAYER_ABOVE,
} from "./skeleton.consts.js";

export const frontSkeleton = [
	[ BONE_TORSO, {
		texture : TorsoPng,
		position : { x : 6, y : 13 },
		pivot : { x : 4, y : 3 },
		layer : LAYER_ABOVE,
		display : true,
	}],

	[ BONE_LEFTHIP, {
		texture : LeftHipPng,
		position : { x : 0, y : 5 },
		pivot : { x : 1, y : 1 },
		parent : "torso",
		layer : LAYER_BEHIND,
		display : true,
	}],

	[ BONE_RIGHTHIP, {
		texture : RightHipPng,
		position : { x : 7, y : 5 },
		pivot : { x : 2, y : 1 },
		parent : "torso",
		layer : LAYER_BEHIND,
		display : true,
	}],

	[ BONE_LEFTLEG, {
		texture : LeftLegPng,
		position : { x : 4, y : 3 },
		pivot : { x : 3, y : 0 },
		parent : "leftHip",
		layer : LAYER_ABOVE,
	}],

	[ BONE_RIGHTLEG, {
		texture : RightLegPng,
		position : { x : 0, y : 3 },
		pivot : { x : 0, y : 0 },
		parent : "rightHip",
		layer : LAYER_ABOVE,
		display : true,
	}],

	[ BONE_LEFTSHOULDER, {
		texture : LeftShoulderPng,
		position : { x : -1, y : 0 },
		pivot : { x : 0, y : 1 },
		parent : "torso",
		layer : LAYER_ABOVE,
		display : true,
	}],

	[ BONE_RIGHTSHOULDER, {
		texture : RightShoulderPng,
		position : { x : 8, y : 0 },
		pivot : { x : 2, y : 1 },
		parent : "torso",
		layer : LAYER_ABOVE,
		display : true,
	}],

	[ BONE_LEFTARM, {
		texture : LeftArmPng,
		position : { x : 1, y : 2 },
		pivot : { x : 1, y : 0 },
		parent : "leftShoulder",
		layer : LAYER_ABOVE,
		display : true,
	}],

	[ BONE_RIGHTARM, {
		texture : RightArmPng,
		position : { x : 1, y : 2 },
		pivot : { x : 0, y : 0 },
		parent : "rightShoulder",
		layer : LAYER_ABOVE,
		display : true,
	}],

	[ BONE_HEAD, {
		texture : HeadPng,
		position : { x : 5, y : 4 },
		pivot : { x : 5, y : 3 },
		layer : LAYER_ABOVE,
		display : true,
	}],

	[ BONE_HAIR, {
		texture : HairPng,
		position : { x : 2, y : 5 },
		pivot : { x : 2, y : 3 },
		layer : LAYER_ABOVE,
		display : true,
	}],
];
