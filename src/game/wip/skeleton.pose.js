import {
	JOINT_LEFTARM,
	JOINT_RIGHTLEG,
	BONE_TORSO,
	JOINT_HEAD,
	BONE_HAIR,
	JOINT_LEFTLEG,
	JOINT_RIGHTARM,
} from "./skeleton.consts.js";

// lols
export const copyPose = (pose) => JSON.parse(JSON.stringify(pose));

const SOURCE = [
	[ JOINT_LEFTARM, { y : 0, z : 0 }],
	[ JOINT_RIGHTLEG, { y : 0, z : 0 }],
	[ BONE_TORSO, { tilt : 0 }],
	[ JOINT_HEAD, { y : 0 }],
	[ BONE_HAIR, { y : 0 }],
	[ JOINT_RIGHTARM, { y : 0, z : 0 }],
	[ JOINT_LEFTLEG, { y : 0, z : 0 }],
];

const SOURCE_OBJECT = Object.fromEntries(SOURCE);

export const POSE_ITEMS = SOURCE.map(([ boneId ]) => boneId);
export const KEYS_BY_ITEM = SOURCE.reduce((acc, [ boneId, values ]) => {
	acc[boneId] = Object.keys(values);

	return acc;
}, {});

export const createPose = () => copyPose(SOURCE_OBJECT);

export const createPoseFrom = (sparsePose) => {
	const pose = createPose();

	for(const boneId of POSE_ITEMS) {
		if(!sparsePose[boneId]) {
			continue;
		}

		for(const key of KEYS_BY_ITEM[boneId]) {
			if(!sparsePose[boneId][key]) {
				continue;
			}

			pose[boneId][key] = sparsePose[boneId][key];
		}
	}

	return pose;
};
