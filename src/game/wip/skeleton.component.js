import { Container, Sprite, Assets } from "pixi.js";

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

export const createSkeleton = (boneDefs, createResolver) => {
	const container = new Container();

	const boneArr = [];
	const bones = {};

	for(const [ name, definition ] of boneDefs) {
		const {
			parent = null,
			position = { x : 0, y : 0 },
			pivot = { x : 0, y : 0 },
			display = true,
			layer = LAYER_ABOVE,
		} = definition;

		const sprite = new Sprite({ pivot, position : pivot });

		if(!display) {
			sprite.visible = false;
		}

		const node = new Container({
			position,
			pivot,
			children : [ sprite ],
		});

		bones[name] = {
			name,
			node,
			sprite,
			parent,
			textureUrl : definition.texture,
			z : layer,

			origin : {
				x : position.x,
				y : position.y,

				// ! these are just static values right now..
				rotation : node.rotation,
				scaleX : node.scale.x,
				scaleY : node.scale.y,
				pivot,
			},
		};

		boneArr.push(bones[name]);
	}

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

	const resetBone = (bone) => {
		const { node, sprite, origin } = bone;

		node.position.set(origin.x, origin.y);
		node.rotation = origin.rotation;
		node.scale.set(origin.scaleX, origin.scaleY);
		node.skew.set(0, 0);

		sprite.position.set(origin.pivot.x, origin.pivot.y);
		sprite.rotation = origin.rotation;
		sprite.scale.set(origin.scaleX, origin.scaleY);
		sprite.skew.set(0, 0);
	};

	const skeleton = {
		container,
		bones,
		reset(name) {
			if(name) {
				resetBone(bones[name]);
				return;
			}

			for(const bone of boneArr) {
				resetBone(bone);
			}
		},
	};

	const resolver = createResolver(skeleton);

	skeleton.update = (pose) => {
		resolver.update(pose);
	};

	skeleton.load = async () => {
		await Promise.all(boneArr.map(async (bone) => {
			bone.sprite.texture = await Assets.load(bone.textureUrl);
		}));

		await resolver.load();
	};

	return skeleton;
};
