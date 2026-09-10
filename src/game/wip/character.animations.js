import { createAnimation } from "./skeleton.animation.js";

import { trapezoid, wrap } from "$util/math.js";

const triangle = (t) => trapezoid(wrap(t), 0.5);

const pulse = (t) => {
	t = wrap(t);

	return t < 0.5
		? trapezoid(t * 2, 0.5)
		: 0;
};

const LEG_LIFT_START = 0.05;
const LEG_APEX = 0.5;
const LEG_TOUCHDOWN = 0.95;

const LEG_LIFT_DURATION = LEG_APEX - LEG_LIFT_START;
const LEG_LOWER_DURATION = LEG_TOUCHDOWN - LEG_APEX;

const ease = (t) => t * t * (3 - 2 * t);

const legStep = (t) => {
	t = wrap(t);

	if(t < LEG_LIFT_START) {
		return 0;
	}

	if(t < LEG_APEX) {
		const liftPhase = (t - LEG_LIFT_START) / LEG_LIFT_DURATION;

		return ease(liftPhase);
	}

	if(t < LEG_TOUCHDOWN) {
		const lowerPhase = (t - LEG_APEX) / LEG_LOWER_DURATION;

		return 1 - ease(lowerPhase);
	}

	return 0;
};

export const createFrontFacingRunAnimation = (skeleton) => {
	const {
		head,
		hair,
		torso,
		leftArm,
		rightArm,
		leftHip,
		rightHip,
		leftLeg,
		rightLeg,
	} = skeleton.bones;

	return createAnimation({
		duration : 1100,

		update(phase) {
			const gaitPhase = wrap(phase * 2);
			const bobPhase = wrap(phase * 3);

			const gait = triangle(gaitPhase);
			const hairBob = triangle(bobPhase);
			const headBob = pulse(bobPhase);

			head.node.y = head.origin.y + headBob;
			hair.node.y = hair.origin.y + (hairBob * 0.5);

			hair.node.rotation = hairBob * -0.2;

			const armSwing = trapezoid(wrap(gaitPhase), 0.5);

			leftArm.node.rotation = -0.2 + (armSwing * 0.8);
			rightArm.node.rotation = -0.6 + (armSwing * 0.8);

			const torsoRot = (gait * 0.75) - (0.75 / 2);
			torso.node.rotation = torsoRot;

			const leftLegMotion = legStep(gaitPhase);
			const rightLegMotion = legStep(gaitPhase + 0.5);

			leftLeg.node.scale.y = 1 - (leftLegMotion * 0.2);
			rightLeg.node.scale.y = 1 - (rightLegMotion * 0.2);
			leftLeg.node.skew.x = leftLegMotion * 0.6;
			rightLeg.node.skew.x = -rightLegMotion * 0.6;

			leftHip.node.rotation = -torsoRot;
			rightHip.node.rotation = -torsoRot;
		},
	});
};
