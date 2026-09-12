import {
	BONE_LEFTHIP,
	BONE_RIGHTHIP,
	BONE_LEFTLEG,
	BONE_RIGHTLEG,
	BONE_LEFTARM,
	BONE_RIGHTARM,
	BONE_LEFTSHOULDER,
	BONE_RIGHTSHOULDER,
} from "./skeleton.consts.js";

const createFrontFacingLegResolver = ({ isLeft, skeleton }) => {
	const selfValue = isLeft ? BONE_LEFTLEG : BONE_RIGHTLEG;

	const {
		[isLeft ? BONE_LEFTHIP : BONE_RIGHTHIP] : hip,
		[selfValue] : leg,
	} = skeleton.bones;

	let maxLegHeight = 0;

	return {
		update(values) {
			const position = values[selfValue];

			const legDy = maxLegHeight * position.y;
			const scale = 1 - position.y;
			const legScaleX = Math.min(scale, 1);

			leg.node.position.y = leg.origin.y - legDy;
			// leg.node.position.x = leg.origin.x - legDy * -DIR;
			leg.sprite.scale.x = legScaleX;
			hip.sprite.scale.y = scale;
			hip.sprite.rotation = -position.y;
		},

		async load() {
			maxLegHeight = hip.node.height;
		},
	};
};

const createArmResolver = ({ isLeft, skeleton }) => {
	const selfValue = isLeft ? BONE_LEFTARM : BONE_RIGHTARM;

	const {
		[isLeft ? BONE_LEFTSHOULDER : BONE_RIGHTSHOULDER] : shoulder,
		[selfValue] : arm,
	} = skeleton.bones;

	const DIR = isLeft ? -1 : 1;

	return {
		update(values) {
			const position = values[selfValue];

			// this is very lazy
			shoulder.node.rotation = position.y * 0.8 * DIR;
			arm.node.rotation = (position.y - 0.2) * 1.1 * DIR;

			shoulder.sprite.position.y = shoulder.origin.y + Math.round(position.y);
		},

		async load() {},
	};
};

const createTorsoResolver = ({ skeleton }) => {
	const { torso } = skeleton.bones;

	return {
		update(values) {
			torso.sprite.rotation = values.torso.tilt * 0.2;
		},

		async load() {},
	};
};

const createHeadResolver = ({ skeleton }) => {
	const { head } = skeleton.bones;

	return {
		update(values) {
			head.node.position.y = head.origin.y + values.head.y;
		},

		async load() {},
	};
};

// hair resolution probably shouldn't be a part of the skeleton resolution, like at all.
const createHairResolver = ({ skeleton }) => {
	const { hair } = skeleton.bones;

	return {
		update(values) {
			hair.node.position.y = hair.origin.y + values.head.y - values.hair.y;
		},

		async load() {},
	};
};

export const createFrontFacingResolver = (skeleton) => {
	const leftLeg = createFrontFacingLegResolver({ isLeft : true, skeleton });
	const rightLeg = createFrontFacingLegResolver({ isLeft : false, skeleton });
	const leftArm = createArmResolver({ isLeft : true, skeleton });
	const rightArm = createArmResolver({ isLeft : false, skeleton });
	const torso = createTorsoResolver({ skeleton });
	const head = createHeadResolver({ skeleton });
	const hair = createHairResolver({ skeleton });

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
