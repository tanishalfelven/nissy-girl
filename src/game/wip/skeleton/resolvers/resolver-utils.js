import {
	JOINT_HEAD,
	BONE_HAIR,
} from "../skeleton.consts.js";

// hair resolution probably shouldn't be a part of the skeleton resolution, like at all.
export const createHairResolver = ({ skeleton }) => {
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
