import { createAnimation } from "./skeleton.animation.js";

import { wrap } from "$util/math.js";

import { createPose } from "./skeleton.pose.js";
import { BONE_HAIR, BONE_TORSO, JOINT_HEAD, JOINT_LEFTARM, JOINT_LEFTLEG, JOINT_RIGHTARM, JOINT_RIGHTLEG } from "./skeleton.consts.js";

const wave = (phase) => Math.sin(phase * Math.PI * 2);

const createWave = (min, max) => (phase) => wave(phase) * ((max - min) / 2) + ((min + max) / 2);

export const ANIMID_RUN = "RUN";

export const createRunAnimation = (skeleton) => {
	const pose = createPose();

	const armY = createWave(0, 0.6);
	const legY = createWave(0, 0.35);

	return createAnimation({
		id : ANIMID_RUN,
		duration : 600,
		looping : true,

		update(phase) {
			pose[JOINT_LEFTLEG].z = wave(phase) * 1;
			pose[JOINT_LEFTLEG].y = legY(phase);
			pose[JOINT_LEFTARM].y = armY(-phase);

			pose[JOINT_RIGHTLEG].z = -wave(phase) * 1;
			pose[JOINT_RIGHTLEG].y = legY(-phase);
			pose[JOINT_RIGHTARM].y = armY(phase);

			pose[BONE_TORSO].tilt = wave(phase);

			pose[JOINT_HEAD].y = wrap(phase);
			pose[BONE_HAIR].y = wrap(phase);
		},

		apply() {
			skeleton.update(pose);
		},

		getSample() {
			return pose;
		},
	});
};
