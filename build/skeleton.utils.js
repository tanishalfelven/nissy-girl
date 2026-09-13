import { NODETYPE_ROOT, NODETYPE_JOINT, NODETYPE_BONE, JOINTS } from "./skeleton.consts.js";

import { subtractPosition } from "./sprite.utils.js";

export const createFace = (skeleton, faceId) => {
	const face = ({
		type : NODETYPE_ROOT,
		faceId,
		children : [],
		joints : {},
		bones : {},
	});

	skeleton.faces[faceId] = face;
	skeleton.faceIds.push(faceId);

	return face;
};

const boneTextureId = (faceId, jointId, boneId) => {
	if(!jointId) {
		return `${faceId}-${boneId}`;
	}

	return `${faceId}-${jointId}-${boneId}`;
};

export const createBone = ({ faceId, boneId, position, parent }) => {
	if(!parent) {
		throw new Error(`Unable to determine parent for bone "${boneId}".`);
	}

	const jointId = parent.jointId;

	const bone = ({
		parent : jointId ?? NODETYPE_ROOT,
		type : NODETYPE_BONE,
		boneId,
		position,
		textureId : boneTextureId(faceId, jointId, boneId),
	});

	parent.bones[boneId] = bone;

	if(parent.boneIds) {
		parent.boneIds.push(boneId);
	}

	if(bone.parent === NODETYPE_ROOT) {
		parent.children.push({
			type : NODETYPE_BONE,
			id : boneId,
		});
	}

	return bone;
};

export const createJoint = (face, jointId) => {
	const joint = ({
		jointId,
		type : NODETYPE_JOINT,
		bones : {},
		boneIds : [],
		// added later when resolveJoint occurs
		jointType : false,
		position : false,
	});

	face.joints[jointId] = joint;

	face.children.push({
		type : NODETYPE_JOINT,
		id : joint.jointId,
	});

	return joint;
};

const resolveJointType = (joint) => {
	const boneIds = new Set(joint.boneIds);

	// priority is a schema match
	for(const schema of JOINTS) {
		const matches = schema.bones.every((boneId) => boneIds.has(boneId));

		if(matches) {
			return schema;
		}
	}

	// otherwise a layer with no schema has the same named bone become its anchor, name is also its type
	if(boneIds.has(joint.jointId)) {
		return {
			type : joint.jointId,
			anchor : joint.jointId,
			bones : [ joint.jointId ],
		};
	}

	// otherwise you fucked up
	throw new Error(`Unable to infer joint type for "${joint.jointId}". Bones: ${[ ...boneIds ].join(", ")}.`);
};

// in place resolve bone joint positions
export const resolveJoint = (joint) => {
	const schema = resolveJointType(joint);

	const anchor = joint.bones[schema.anchor];

	const jointPosition = {
		...anchor.position,
	};

	joint.position = jointPosition;

	joint.jointType = schema.type;

	for(const boneId of joint.boneIds) {
		const bone = joint.bones[boneId];

		bone.position = subtractPosition(bone.position, jointPosition);
	}
};
