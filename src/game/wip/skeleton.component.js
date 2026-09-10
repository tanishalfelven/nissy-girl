import { Container, Sprite, Assets } from "pixi.js";

export const createSkeleton = (boneDefs) => {
	const container = new Container();

	const boneArr = [];
	const bones = {};

	for(const [ name, definition ] of boneDefs) {
		const {
			parent = null,
			position = { x : 0, y : 0 },
			pivot = { x : 0, y : 0 },
		} = definition;

		const sprite = new Sprite();

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

			origin : {
				x : position.x,
				y : position.y,

				// ! these are just static values right now..
				rotation : node.rotation,
				scaleX : node.scale.x,
				scaleY : node.scale.y,
			},
		};

		boneArr.push(bones[name]);
	}

	for(const bone of boneArr) {
		const parent = bone.parent
			? bones[bone.parent].node
			: container;

		parent.addChild(bone.node);
	}

	const resetBone = (bone) => {
		const { node, origin } = bone;

		node.position.set(origin.x, origin.y);
		node.rotation = origin.rotation;
		node.scale.set(origin.scaleX, origin.scaleY);
		node.skew.set(0, 0);
	};

	const load = () => {
		return Promise.all(boneArr.map(async (bone) => {
			bone.sprite.texture = await Assets.load(bone.textureUrl);
		}));
	};

	return {
		container,
		bones,
		load,

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
};
