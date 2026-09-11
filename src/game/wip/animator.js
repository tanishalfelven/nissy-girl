import { lerp } from "$util/math.js";
import { createAnimation } from "./skeleton.animation.js";
import { BONE_RIGHTARM, BONE_LEFTARM } from "./skeleton.consts.js";
import { createPoseFrom, copyPose, POSE_ITEMS, KEYS_BY_ITEM } from "./skeleton.pose.js";

const defaultPose = createPoseFrom({
	[BONE_RIGHTARM] : { y : 0.24 },
	[BONE_LEFTARM] : { y : 0.24 },
});

const IDLE_STATE = "IDLE";
const TRANSITION_DURATION = 180;

export const createAnimator = (skeleton, animationArr) => {
	let deltaPose = copyPose(defaultPose);
	let targetPose = false;

	skeleton.update(deltaPose);

	let state = IDLE_STATE;
	let animation = false;

	const animations = new Map(animationArr.map((animationFactory) => {
		const anim = animationFactory(skeleton);

		return [ anim.id, anim ];
	}));

	const deltaAnimation = createAnimation({
		// not reported outwardly as our animation
		id : "_delta",
		duration : TRANSITION_DURATION,
		update(phase) {
			for(const boneId of POSE_ITEMS) {
				for(const key of KEYS_BY_ITEM[boneId]) {
					// lerp and assign for a slight ease
					deltaPose[boneId][key] = lerp(phase, deltaPose[boneId][key], targetPose[boneId][key]);
				}
			}
		},
		getSample() {
			return deltaPose;
		},
		apply() {
			skeleton.update(deltaPose);
		},
	});

	return {
		isActive(animId) {
			return state === animId;
		},

		start(animId) {
			if(!animations.has(animId)) {
				throw new Error(`Attmpted to start invalid animation ${animId}`);
			}

			state = animId;
			animation = deltaAnimation;
			// ! ASSUMPTION that start only occurs from a fully stopped position. That's fine for now.
			deltaPose = copyPose(defaultPose);
			targetPose = animations.get(animId).sample(0);
			animation.start();
		},

		stop() {
			// ! not reseting the skeleton anymore

			state = IDLE_STATE;

			deltaPose = copyPose(animation.sample());
			animation.reset();
			// ! reusing the target pose here, maybe a bad idea
			targetPose = defaultPose;

			animation = deltaAnimation;
			animation.start();
		},

		update(dt) {
			if(state === IDLE_STATE && !animation) {
				return;
			}

			animation.update(dt);

			// delta anims are handled separately
			if(!animations.has(animation.id)) {
				// when our delta finishes
				if(!animation.active()) {
					// idle means we're done
					if(state === IDLE_STATE) {
						animation = false;
					} else {
					// if we're not idle immediately start next anim
						animation = animations.get(state);
						animation.start();
					}
				}
			}
		},
	};
};
