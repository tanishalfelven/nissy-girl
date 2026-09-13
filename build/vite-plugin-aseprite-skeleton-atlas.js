import {
	createFace,
	createBone,
	createJoint,
	resolveJoint,
} from "./skeleton.utils.js";

import { getFramePosition, isTextureLayer, normalizeFrame } from "./sprite.utils.js";

const asepriteSkeletonAtlas = "?aseprite-skeleton-atlas";

const _createSkeleton = () => ({
	faces : {},
	faceIds : [],
});

const computeSkeletonAndFrames = (sourceFrames, layers) => {
	const skeleton = _createSkeleton();
	const jointsById = new Map();
	const frames = {};

	let face = false;
	let frameIndex = 0;

	for(const layer of layers) {
		const isFaceLayer = !layer.group;

		if(isFaceLayer) {
			face = createFace(skeleton, layer.name);

			// layer data is flat traversal, encountering a new group is where we reset our context
			jointsById.clear();

			continue;
		}

		if(isTextureLayer(layer)) {
			const boneFrame = sourceFrames[frameIndex++];

			const bone = createBone({
				parent : jointsById.get(layer.group) ?? face,
				faceId : face.faceId,
				boneId : layer.name,
				position : getFramePosition(boneFrame),
			});

			frames[bone.textureId] = normalizeFrame(
				boneFrame,
				bone.textureId,
			);

			continue;
		}

		// this must be a joint definition
		const joint = createJoint(face, layer.name);

		// keep track of joints for face for bones to reference
		jointsById.set(
			joint.jointId,
			joint,
		);
	}

	for(const faceId of skeleton.faceIds) {
		const face = skeleton.faces[faceId];

		// ! wasteful object.values?
		for(const joint of Object.values(face.joints)) {
			resolveJoint(joint);
		}
	}

	return [ skeleton, frames ];
};

export default() => ({
	name : "aseprite-skeleton-atlas",

	transform : {
		handler(code, id) {
			if(!id.includes(asepriteSkeletonAtlas)) {
				return false;
			}

			const sourceData = JSON.parse(code);

			const [ skeleton, frames ] = computeSkeletonAndFrames(
				sourceData.frames,
				sourceData.meta.layers,
			);

			const result = {
				...sourceData,
				frames,
				skeleton,
			};

			return {
				code : `export default ${JSON.stringify(result)};`,
				map : null,
			};
		},
	},
});
