import { Container, Sprite } from "pixi.js";

import { getAtlas } from "$game/util/texture-atlas.js";

import { LAYER_ABOVE, LAYER_BEHIND } from "./skeleton.consts.js";

const createLayers = (bone) => {
	const above = new Container();
	const behind = new Container();

	bone.node.removeChild(bone.sprite);
	bone.node.addChild(behind, bone.sprite, above);

	bone.layers = {
		[LAYER_ABOVE] : above,
		[LAYER_BEHIND] : behind,
	};
};

const ZERO_ZERO = { x : 0, y : 0 };

const createBone = ({
	id,
	parent = false,
	position = ZERO_ZERO,
	pivot = ZERO_ZERO,
	display = true,
	layer = LAYER_ABOVE,
}) => {
	const sprite = new Sprite({ pivot, position : pivot });

	if(!display) {
		sprite.visible = false;
	}

	const node = new Container({
		position,
		pivot,
		children : [ sprite ],
	});

	const origin = {
		x : position.x,
		y : position.y,

		rotation : node.rotation,
		scaleX : node.scale.x,
		scaleY : node.scale.y,
		pivot,
	};

	return {
		node,
		sprite,

		id,
		parent,

		z : layer,

		origin,

		reset : () => {
			node.position.set(origin.x, origin.y);
			node.rotation = origin.rotation;
			node.scale.set(origin.scaleX, origin.scaleY);
			node.skew.set(0, 0);

			sprite.position.set(origin.pivot.x, origin.pivot.y);
			sprite.rotation = origin.rotation;
			sprite.scale.set(origin.scaleX, origin.scaleY);
			sprite.skew.set(0, 0);
		},
	};
};

const toTextureId = (faceId, boneId) => `${faceId}-${boneId}`;

const createFace = (id) => {
	const container = new Container();
	const bones = {};
	const boneArr = [];

	return {
		id,
		bones,
		boneArr,
		container,

		addBone : (bone) => {
			bones[bone.id] = bone;
			boneArr.push(bone);
		},

		resolveLayering : () => {
			for(const bone of boneArr) {
				if(!bone.parent) {
					container.addChild(bone.node);

					continue;
				}

				const parent = bones[bone.parent];

				if(!parent.layers) {
					createLayers(parent);
				}

				parent.layers[bone.z].addChild(bone.node);
			}
		},

		setupTextures(spritesheet) {
			for(const bone of boneArr) {
				const textureId = toTextureId(id, bone.id);
				const texture = spritesheet.textures[textureId];

				if(!texture) {
					throw new Error(`Missing skeleton texture: ${textureId}`);
				}

				bone.sprite.texture = texture;
			}
		},

		reset : () => {
			for(const bone of boneArr) {
				bone.reset();
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

		resolveLayering : () => {
			for(const face of faceArr) {
				face.resolveLayering();
			}
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
	const skeleton = _createSkeleton(skeletonData.id);

	for(const faceDefinition of skeletonData.faces) {
		const face = createFace(faceDefinition.id);

		skeleton.addFace(face);

		for(const boneDefinition of faceDefinition.bones) {
			const bone = createBone(boneDefinition);

			face.addBone(bone);
		}
	}

	skeleton.resolveLayering();

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
