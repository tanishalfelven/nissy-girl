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
	FACE_RIGHT,
} from "../skeleton.consts.js";

import { Graphics } from "pixi.js";
import { COLOR_WHITE, COLOR_BROWN, COLOR_BLACK } from "$nissy-girl/screens/render.consts.js";

import { createHairResolver } from "./resolver-utils.js";

const HALF_PI = Math.PI / 2;

const createLegResolver = ({ isLeft, skeleton }) => {
	const jointId = isLeft ? JOINT_LEFTLEG : JOINT_RIGHTLEG;

	const {
		[jointId] : legJoint,
	} = skeleton.joints;

	const {
		[BONE_HIP] : hipBone,
		[BONE_LEG] : legBone,
	} = legJoint.bones;

	const isFacingRight = skeleton.id === FACE_RIGHT;
	const FACING = isFacingRight ? 1 : -1;

	return {
		update(values) {
			const position = values[jointId];

			if(Math.abs(position.z) > 0.05) {
				legBone.node.position.x = legBone.origin.x + position.z * 7 * FACING + FACING * 3;
			} else {
				legBone.node.position.x = legBone.origin.x;
			}

			legJoint.node.x = legJoint.origin.x - values[BONE_TORSO].lean * FACING * 4;

			legBone.node.position.y = legBone.origin.y + -Math.abs(position.z) * 4.1;
			legBone.node.scale.set(Math.abs(position.z) * -0.15 + 1);
			hipBone.node.rotaton = position.z * 1.8 * -FACING;
			legBone.node.rotation = position.z * 1.8 * -FACING;
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

	const isFacingRight = skeleton.id === FACE_RIGHT;
	const FACING = isFacingRight ? -1 : 1;

	return {
		update(values) {
			const position = values[jointId];

			armJoint.node.rotation = FACING * 0.25 + position.z * HALF_PI * FACING * 1.4;
			armBone.node.rotation = armJoint.node.rotation * -1.1;
		},

		async load() {},
	};
};

const createTorsoResolver = ({ skeleton }) => {
	const { [BONE_TORSO] : torsoBone } = skeleton.bones;

	const isFacingRight = skeleton.id === FACE_RIGHT;
	const DIR = isFacingRight ? 1 : -1;

	return {
		update(values) {
			skeleton.node.x = values[BONE_TORSO].lean * -DIR * 2;
			torsoBone.node.position.y = torsoBone.origin.y + values[JOINT_HEAD].y;
			torsoBone.node.rotation = values[BONE_TORSO].lean * DIR;
		},

		async load() {},
	};
};

export const createHeadResolver = ({ skeleton }) => {
	const { [JOINT_HEAD] : headJoint } = skeleton.joints;

	const isFacingRight = skeleton.id === FACE_RIGHT;
	const DIR = isFacingRight ? 1 : -1;

	return {
		update(values) {
			headJoint.node.position.y = headJoint.origin.y + values[JOINT_HEAD].y;
			headJoint.node.position.x = headJoint.origin.x + values[JOINT_HEAD].z * DIR;
		},

		async load() {},
	};
};

const createFace = ({ skeleton }) => {
	// this definitely needs to move to some sort of facial expresion manager
	// perhaps this exists more at the resolver layer TBH
	const { [JOINT_HEAD] : headJoint } = skeleton.joints;

	const isFacingRight = skeleton.id === FACE_RIGHT;

	const eyes = new Graphics();
	const pupils = new Graphics();

	let x = 1;

	if(isFacingRight) {
		x = 6;
	}

	eyes.rect(x, 7, 2, 1).fill(COLOR_WHITE);
	eyes.rect(x, 6, 2, 1).fill(COLOR_BROWN);
	pupils.rect(x + isFacingRight, 7, 1, 1).fill(COLOR_BLACK);

	headJoint.node.addChild(eyes, pupils);
};

export const createSideResolver = ({ face }) => {
	const leftLeg = createLegResolver({ isLeft : true, skeleton : face });
	const rightLeg = createLegResolver({ isLeft : false, skeleton : face });
	const leftArm = createArmResolver({ isLeft : true, skeleton : face });
	const rightArm = createArmResolver({ isLeft : false, skeleton : face });
	const torso = createTorsoResolver({ skeleton : face });

	const head = createHeadResolver({ skeleton : face });
	const hair = createHairResolver({ skeleton : face });

	createFace({ skeleton : face });

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
