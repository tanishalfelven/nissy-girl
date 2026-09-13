import {
	BONE_HIP,
	BONE_LEG,
	JOINT_LEFTLEG,
	JOINT_RIGHTLEG,
	JOINT_LEFTARM,
	JOINT_RIGHTARM,
	JOINT_HEAD,
	BONE_HAIR,
	BONE_TORSO,
	BONE_ARM,
} from "./skeleton.consts.js";

const createFrontFacingLegResolver = ({ isLeft, skeleton }) => {
	const jointId = isLeft ? JOINT_LEFTLEG : JOINT_RIGHTLEG;

	const {
		[jointId] : legJoint,
	} = skeleton.joints;

	const {
		[BONE_HIP] : hipBone,
		[BONE_LEG] : legBone,
	} = legJoint.bones;

	let maxLegHeight = 0;

	return {
		update(values) {
			const position = values[jointId];

			const legDy = maxLegHeight * position.y;
			const scale = 1 - position.y;
			const legScaleX = Math.min(scale, 1);

			legBone.node.position.y = legBone.origin.y - legDy;
			legBone.node.scale.x = legScaleX;
			hipBone.node.scale.y = scale;
			hipBone.node.rotation = -position.y;
		},

		async load() {
			maxLegHeight = legJoint.node.height;
		},
	};
};

const createArmResolver = ({ isLeft, skeleton }) => {
	const jointId = isLeft ? JOINT_LEFTARM : JOINT_RIGHTARM;

	const { [jointId] : armJoint } = skeleton.joints;
	const {
		// [BONE_SHOULDER] : shoulderBone,
		[BONE_ARM] : armBone,
	} = armJoint.bones;

	const DIR = isLeft ? -1 : 1;

	return {
		update(values) {
			const position = values[jointId];

			// this is very lazy
			armJoint.node.rotation = position.y * 0.8 * DIR;
			armBone.node.rotation = (position.y - 0.2) * 1.1 * DIR;
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
			headJoint.node.position.y = headJoint.origin.y + values[JOINT_HEAD].y;
		},

		async load() {},
	};
};

// hair resolution probably shouldn't be a part of the skeleton resolution, like at all.
const createHairResolver = ({ skeleton }) => {
	const { [JOINT_HEAD] : headJoint } = skeleton.joints;
	const { [BONE_HAIR] : hairBone } = headJoint.bones;

	return {
		update(values) {
			// ! for the moment we are locking hair pos to the head
			hairBone.node.position.y = hairBone.origin.y + values[JOINT_HEAD].y - values[BONE_HAIR].y;
		},

		async load() {},
	};
};

export const createFrontFacingResolver = (face) => {
	// ! a skeleton in the context of a resolver is a single face
	// ! shrug for now
	const leftLeg = createFrontFacingLegResolver({ isLeft : true, skeleton : face });
	const rightLeg = createFrontFacingLegResolver({ isLeft : false, skeleton : face });
	const leftArm = createArmResolver({ isLeft : true, skeleton : face });
	const rightArm = createArmResolver({ isLeft : false, skeleton : face });
	const torso = createTorsoResolver({ skeleton : face });
	const head = createHeadResolver({ skeleton : face });
	const hair = createHairResolver({ skeleton : face });

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
			return Promise.all(limbs.map((resolver) => resolver.load()));
		},
	};
};
