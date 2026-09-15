import { Container, Sprite } from "pixi.js";

import { getAtlas } from "$game/util/spritesheet/texture-atlas.js";

import { TYPE_BONE, TYPE_JOINT, FACE_FRONT, JOINT_RIGHTARM, JOINT_LEFTARM } from "./skeleton.consts.js";

import { createPoseFrom, copyPose } from "./skeleton.pose.js";

const defaultPose = createPoseFrom({
	[JOINT_RIGHTARM] : { y : 0.2 },
	[JOINT_LEFTARM] : { y : 0.2 },
});

export const getDefaultPose = () => copyPose(defaultPose);

const addPoint = (a, b) => ({
	x : a.x + b.x,
	y : a.y + b.y,
});

const resetNode = (node, origin) => {
	node.position.set(origin.x, origin.y);
	node.rotation = origin.rotation;
	node.scale.set(origin.scaleX, origin.scaleY);
	node.skew.set(0, 0);
};

const createBone = (inputSource, modifier) => {
	const {
		boneId : id,
		textureId,
	} = inputSource;
	const {
		pivot,
	} = modifier;

	const position = addPoint(inputSource.position, pivot);

	const node = new Sprite({ pivot, position });

	if(!modifier.display) {
		node.visible = false;
	}

	const origin = {
		x : position.x,
		y : position.y,

		rotation : node.rotation,
		scaleX : node.scale.x,
		scaleY : node.scale.y,
		pivot,
	};

	return {
		id,

		node,
		origin,

		setupTexture(spritesheet) {
			node.texture = spritesheet.textures[textureId];
		},

		reset : () => resetNode(node, origin),
	};
};

const createJoint = (inputSource, modifier) => {
	const {
		jointId : id,
		boneIds,
	} = inputSource;
	const {
		pivot,
	} = modifier;

	const position = addPoint(inputSource.position, pivot);

	const node = new Container({
		pivot,
		position : position,
	});

	if(!modifier.display) {
		node.visible = false;
	}

	const origin = {
		x : position.x,
		y : position.y,

		rotation : node.rotation,
		scaleX : node.scale.x,
		scaleY : node.scale.y,
		pivot,
	};

	const bones = {};

	for(const boneId of boneIds) {
		const bone = createBone(
			inputSource.bones[boneId],
			{
				pivot,

				// modifier bone data overrides joint modifier
				...modifier.bones[boneId],
			},
		);

		bones[boneId] = bone;
		node.addChild(bone.node);
	}

	return {
		id,
		node,
		origin,
		boneIds,
		bones,

		setupTextures : (spritesheet) => {
			for(const boneId of boneIds) {
				const bone = bones[boneId];

				bone.setupTexture(spritesheet);
			}
		},

		reset : () => {
			resetNode(node, origin);

			for(const boneId of boneIds) {
				bones[boneId].reset();
			}
		},
	};
};

const createFace = (faceInputSource, modifier) => {
	const {
		faceId : id,
		children,
	} = faceInputSource;

	const node = new Container({
		// disabling pivot is a useful way to see all faces of a rig in place matching spritesheet
		// maybe should be part of a utility mode or something
		pivot : faceInputSource.bones.torso.position,
	});
	const joints = {};
	const jointIds = [];
	const bones = {};
	const boneIds = [];

	node.visible = false;

	for(const childSource of children) {
		const { [childSource.id] : nodeInputSource } = faceInputSource[
			// ! this is awkward
			childSource.type === TYPE_JOINT
				? "joints"
				: "bones"
		];
		const { [childSource.id] : nodeModifier } = modifier;

		let child;

		if(childSource.type === TYPE_JOINT) {
			const joint = createJoint(nodeInputSource, nodeModifier);

			joints[joint.id] = joint;
			jointIds.push(joint.id);

			child = joint;
		} else if(childSource.type === TYPE_BONE) {
			const bone = createBone(nodeInputSource, nodeModifier);

			bones[bone.id] = bone;
			boneIds.push(bone.id);

			child = bone;
		} else {
			throw new Error(`Unknown child "${JSON.stringify(childSource)}"`);
		}

		node.addChild(child.node);
	}

	return {
		id,
		node,
		joints,
		jointIds,
		bones,
		boneIds,

		setupTextures(spritesheet) {
			for(const jointId of jointIds) {
				joints[jointId].setupTextures(spritesheet);
			}

			for(const boneId of boneIds) {
				bones[boneId].setupTexture(spritesheet);
			}
		},

		reset : () => {
			for(const jointId of jointIds) {
				joints[jointId].reset();
			}

			for(const boneId of boneIds) {
				bones[boneId].reset();
			}
		},
	};
};

export const createSkeleton = ({
	skeletonData,
	createResolver,
}) => {
	const { skeleton : sourceSkeletonData } = skeletonData.sourceAtlasData;
	const { data : skeletonModifierData } = skeletonData;

	const container = new Container();
	const faces = {};
	const faceArr = [];

	let activeFace = FACE_FRONT;

	let spritesheet = false;
	let resolver = false;

	for(const faceId of sourceSkeletonData.faceIds) {
		const { [faceId] : faceInputData } = sourceSkeletonData.faces;
		const { [faceId] : faceModifiers } = skeletonModifierData.faces;

		if(!faceModifiers) {
			/* eslint-disable-next-line -- dev warning */
			console.warn(`No modifier data provided for face "${faceId}" - skipping.`);

			continue;
		}

		const face = createFace(faceInputData, faceModifiers);

		faces[face.id] = face;
		faceArr.push(face);

		container.addChild(face.node);
	}

	faces[activeFace].node.visible = true;

	return {
		id : sourceSkeletonData.id,
		faces,
		faceArr,
		container,

		setFace(face) {
			faces[activeFace].node.visible = false;
			activeFace = face;
			faces[activeFace].node.visible = true;
		},

		update : (pose) => {
			if(!resolver) {
				/* eslint-disable-next-line */
				console.warn("Attempted skeleton.update before load, bad.");

				return;
			}

			resolver.update(activeFace, pose);
		},

		load : async () => {
			// need a destruction path for this
			spritesheet = await getAtlas(skeletonData.sourceTexture, skeletonData.sourceAtlasData);

			for(const face of faceArr) {
				face.setupTextures(spritesheet);
			}

			// ! could this cause a timing issue with pixijs resolving sizes of textures and resolvers trying to measure them?
			resolver = createResolver(faces);

			await resolver.load();

			resolver.update(activeFace, defaultPose);
		},

		reset : () => {
			for(const face of faceArr) {
				face.reset();
			}
		},

		destroy() {
			spritesheet?.destroy();
		},
	};
};
