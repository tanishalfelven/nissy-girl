import { createAnimation } from "../util/animations.js";

import { wrap } from "$util/math.js";

import { createPose } from "$game/util/skeleton/skeleton.pose.js";
import {
	BONE_HAIR,
	BONE_TORSO,
	JOINT_HEAD,
	JOINT_LEFTARM,
	JOINT_LEFTLEG,
	JOINT_RIGHTARM,
	JOINT_RIGHTLEG,
} from "$game/util/skeleton/skeleton.consts.js";

const sinWave = (phase) => Math.sin(phase * Math.PI * 2);

const trapezoidWave = (phase, width = 0.5) =>
	Math.max(-1, Math.min(1, sinWave(phase) / width));

const createWave = (
	min,
	max,
	{ wave = sinWave } = false,
) => {
	const amplitude = (max - min) / 2;

	return (phase) => wave(phase) * amplitude + (min + max) / 2;
};

export const ANIMID_RUN = "RUN";

export const createRunAnimation = (skeleton) => {
	const pose = createPose();

	const armY = createWave(-0.2, 0.7);
	const armZ = createWave(-0.35, 0.35);
	const legY = createWave(0, 0.35);
	const legZ = createWave(-0.8, 0.3, {
		wave : (phase) => trapezoidWave(phase + 0.5, 0.7),
	});

	return createAnimation({
		id : ANIMID_RUN,
		duration : 700,
		looping : true,

		update(phase) {
			pose[JOINT_HEAD].y = wrap(phase);
			pose[JOINT_HEAD].z = 1;
			pose[BONE_HAIR].y = wrap(phase);

			pose[BONE_TORSO].tilt = sinWave(-phase);
			pose[BONE_TORSO].lean = 0.2;

			pose[JOINT_LEFTARM].y = armY(-phase);
			pose[JOINT_LEFTARM].z = armZ(phase);

			pose[JOINT_RIGHTARM].y = armY(phase);
			pose[JOINT_RIGHTARM].z = armZ(-phase);

			pose[JOINT_LEFTLEG].z = legZ(phase);
			pose[JOINT_LEFTLEG].y = legY(phase * 2);

			pose[JOINT_RIGHTLEG].z = legZ(-phase);
			pose[JOINT_RIGHTLEG].y = legY(-phase * 2);
		},

		apply() {
			skeleton.update(pose);
		},

		getSample() {
			return pose;
		},
	});
};
