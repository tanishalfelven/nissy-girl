import {
	BONE_HIP,
	BONE_LEG,
	JOINT_LEFTLEG,
	JOINT_RIGHTLEG,
	JOINT_LEFTARM,
	JOINT_RIGHTARM,
	BONE_TORSO,
	BONE_ARM,
	JOINT_HEAD,
	FACE_FRONT,
} from "../skeleton.consts.js";

import { Graphics } from "pixi.js";
import { COLOR_WHITE, COLOR_BROWN, COLOR_BLACK } from "$nissy-girl/screens/render.consts.js";

import { createHairResolver } from "./resolver-utils.js";
import { clamp } from "$util/math.js";

const createLegResolver = ({ isLeft, skeleton }) => {
	const jointId = isLeft ? JOINT_LEFTLEG : JOINT_RIGHTLEG;

	const {
		[jointId] : legJoint,
	} = skeleton.joints;

	const {
		[BONE_HIP] : hipBone,
		[BONE_LEG] : legBone,
	} = legJoint.bones;

	const FACING_FRONT = skeleton.id === FACE_FRONT;
	const FACEDIR = FACING_FRONT ? 1 : -1;

	return {
		update(values) {
			const position = values[jointId];

			const faceZ = FACEDIR * position.z;

			legJoint.node.scale.y = position.z * 0.8 + 1;

			legBone.node.scale.x = clamp(faceZ, 0, 0.5) * -0.7 + 1;
			legBone.node.position.x = legBone.origin.x + Math.min(faceZ, 0);
			hipBone.node.rotation = Math.abs(faceZ) * 0.4;
		},

		async load() {},
	};
};

const createArmResolver = ({ isLeft, skeleton }) => {
	const jointId = isLeft ? JOINT_LEFTARM : JOINT_RIGHTARM;

	const { [jointId] : armJoint } = skeleton.joints;
	const {
		[BONE_ARM] : armBone,
	} = armJoint.bones;

	const FACING_FRONT = skeleton.id === FACE_FRONT;
	const FACEDIR = FACING_FRONT ? -1 : 1;
	const DIR = isLeft ? -1 : 1;

	return {
		update(values) {
			const position = values[jointId];

			armJoint.node.rotation = position.z * 2.6 * DIR * FACEDIR;
			armBone.node.rotation = position.y * 0.6 * DIR * -FACEDIR;
			// as the hand gets further from the camera, shrink it
			armBone.node.scale.x = ((FACING_FRONT && position.z < 0) || (!FACING_FRONT && position.z > 0))
				? 1 - (Math.abs(position.z) * 1.5)
				: 1;
		},

		async load() {},
	};
};

const createTorsoResolver = ({ skeleton }) => {
	const { [BONE_TORSO] : torsoBone } = skeleton.bones;

	return {
		update(values) {
			torsoBone.node.rotation = values[BONE_TORSO].tilt * 0.2;
		},

		async load() {},
	};
};

const createHeadResolver = ({ skeleton }) => {
	const { [JOINT_HEAD] : headJoint } = skeleton.joints;

	return {
		update(values) {
			headJoint.node.position.y = headJoint.origin.y + values[JOINT_HEAD].y * 3;
			headJoint.node.position.y = headJoint.origin.y + values[JOINT_HEAD].y;
		},

		async load() {},
	};
};

const createFace = ({ skeleton }) => {
	// this definitely needs to move to some sort of facial expresion manager
	// perhaps this exists more at the resolver layer TBH
	const { [JOINT_HEAD] : headJoint } = skeleton.joints;

	const eyes = new Graphics();
	const pupils = new Graphics();

	eyes.rect(3, 7, 2, 1).fill(COLOR_WHITE);
	eyes.rect(3, 6, 2, 1).fill(COLOR_BROWN);
	eyes.rect(7, 7, 2, 1).fill(COLOR_WHITE);
	eyes.rect(7, 6, 2, 1).fill(COLOR_BROWN);
	pupils.rect(4, 7, 1, 1).fill(COLOR_BLACK);
	pupils.rect(7, 7, 1, 1).fill(COLOR_BLACK);

	headJoint.node.addChild(eyes, pupils);
};

export const createDepthResolver = ({ face }) => {
	const leftLeg = createLegResolver({ isLeft : true, skeleton : face });
	const rightLeg = createLegResolver({ isLeft : false, skeleton : face });
	const leftArm = createArmResolver({ isLeft : true, skeleton : face });
	const rightArm = createArmResolver({ isLeft : false, skeleton : face });
	const torso = createTorsoResolver({ skeleton : face });
	const head = createHeadResolver({ skeleton : face });
	const hair = createHairResolver({ skeleton : face });

	if(face.id === FACE_FRONT) {
		createFace({ skeleton : face });
	}

	const limbs = [
		leftLeg,
		rightLeg,
		torso,
		head,
		hair,
		leftArm,
		rightArm,
	];

	return {
		update(values) {
			for(const limb of limbs) {
				limb.update(values);
			}
		},

		load() {
			return Promise.all(
				limbs.map((resolver) => resolver.load()),
			);
		},
	};
};
