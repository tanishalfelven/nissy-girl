import { createAnimation } from "./skeleton.animation.js";

import { wrap } from "$util/math.js";

import { createPose } from "./skeleton.resolvers.js";

const wave = (phase) => Math.sin(phase * Math.PI * 2);

const createWave = (min, max) => (phase) => wave(phase) * ((max - min) / 2) + ((min + max) / 2);

export const createFrontFacingRunAnimation = (skeleton) => {
	const pose = createPose();

	const armY = createWave(0, 0.6);
	const legY = createWave(0, 0.35);

	return createAnimation({
		duration : 600,

		update(phase) {
			pose.leftLeg.z = wave(phase) * 1;
			pose.leftLeg.y = legY(phase);
			pose.leftArm.y = armY(-phase);

			pose.rightLeg.z = -wave(phase) * 1;
			pose.rightLeg.y = legY(-phase);
			pose.rightArm.y = armY(phase);

			pose.torso.tilt = wave(phase);

			pose.head.y = wrap(phase);
			pose.hair.y = wrap(phase + 0.5);

			skeleton.update(pose);
		},
	});
};
