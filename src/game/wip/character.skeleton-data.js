import LeftArmPng from "./assets/leftarm.png";
import LeftShoulderPng from "./assets/leftshoulder.png";
import LeftHipPng from "./assets/lefthip.png";
import LeftLegPng from "./assets/leftleg.png";
import RightShoulderPng from "./assets/rightshoulder.png";
import RightArmPng from "./assets/rightarm.png";
import RightHipPng from "./assets/righthip.png";
import RightLegPng from "./assets/rightleg.png";
import HeadPng from "./assets/head.png";
import HairPng from "./assets/hair.png";
import TorsoPng from "./assets/torso.png";

export const frontSkeleton = [
	[ "torso", {
		texture : TorsoPng,
		position : { x : 6, y : 13 },
		pivot : { x : 4, y : 3 },
	}],

	[ "leftHip", {
		texture : LeftHipPng,
		position : { x : 0, y : 5 },
		pivot : { x : 1, y : 1 },
		parent : "torso",
	}],

	[ "rightHip", {
		texture : RightHipPng,
		position : { x : 7, y : 5 },
		pivot : { x : 2, y : 1 },
		parent : "torso",
	}],

	[ "leftLeg", {
		texture : LeftLegPng,
		position : { x : 3, y : 3 },
		pivot : { x : 2, y : 0 },
		parent : "leftHip",
	}],

	[ "rightLeg", {
		texture : RightLegPng,
		position : { x : 0, y : 3 },
		pivot : { x : 0, y : 0 },
		parent : "rightHip",
	}],

	[ "leftShoulder", {
		texture : LeftShoulderPng,
		position : { x : -1, y : 0 },
		pivot : { x : 0, y : 1 },
		parent : "torso",
	}],

	[ "rightShoulder", {
		texture : RightShoulderPng,
		position : { x : 8, y : 0 },
		pivot : { x : 2, y : 1 },
		parent : "torso",
	}],

	[ "leftArm", {
		texture : LeftArmPng,
		position : { x : 1, y : 2 },
		pivot : { x : 1, y : 0 },
		parent : "leftShoulder",
	}],

	[ "rightArm", {
		texture : RightArmPng,
		position : { x : 1, y : 2 },
		pivot : { x : 0, y : 0 },
		parent : "rightShoulder",
	}],

	[ "head", {
		texture : HeadPng,
		position : { x : 5, y : 4 },
		pivot : { x : 5, y : 3 },
	}],

	[ "hair", {
		texture : HairPng,
		position : { x : 2, y : 5 },
		pivot : { x : 2, y : 3 },
	}],
];
