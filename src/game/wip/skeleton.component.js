import { Container, Sprite } from "pixi.js";

import { getAtlas } from "$game/util/texture-atlas.js";

import { TYPE_BONE, TYPE_JOINT } from "./skeleton.consts.js";

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

	const container = new Container();
	const joints = {};
	const jointIds = [];
	const bones = {};
	const boneIds = [];

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

		container.addChild(child.node);
	}

	return {
		id,
		container,
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

const _createSkeleton = (id) => {
	const container = new Container();
	const faces = {};
	const faceArr = [];

	let spritesheet = false;

	return {
		id,
		faces,
		faceArr,
		container,

		addFace : (face) => {
			faces[face.id] = face;
			faceArr.push(face);

			container.addChild(face.container);
		},

		destroy() {
			spritesheet?.destroy();
		},

		setupTextures : (loadedSpritesheet) => {
			spritesheet = loadedSpritesheet;

			for(const face of faceArr) {
				face.setupTextures(spritesheet);
			}
		},

		reset : () => {
			for(const face of faceArr) {
				face.reset();
			}
		},
	};
};

export const createSkeleton = (skeletonData, createResolver) => {
	const { skeleton : sourceSkeletonData } = skeletonData.sourceAtlasData;
	const { data : skeletonModifierData } = skeletonData;

	const skeleton = _createSkeleton(skeletonData.id);

	for(const faceId of sourceSkeletonData.faceIds) {
		const { [faceId] : faceInputData } = sourceSkeletonData.faces;
		const { [faceId] : faceModifiers } = skeletonModifierData.faces;

		if(!faceModifiers) {
			/* eslint-disable-next-line -- dev warning */
			console.warn(`No modifier data provided for face "${faceId}" - skipping.`);

			continue;
		}

		const face = createFace(faceInputData, faceModifiers);

		skeleton.addFace(face);
	}

	// this needs to sync with facings...
	const resolver = createResolver(skeleton.faces.front);

	skeleton.update = (pose) => {
		resolver.update(pose);
	};

	skeleton.load = async () => {
		// need a destruction path for this
		const spritesheet = await getAtlas(skeletonData.sourceTexture, skeletonData.sourceAtlasData);

		skeleton.setupTextures(spritesheet);

		await resolver.load();
	};

	return skeleton;
};
