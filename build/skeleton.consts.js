export const NODETYPE_ROOT = "root";
export const NODETYPE_BONE = "bone";
export const NODETYPE_JOINT = "joint";

// ! these are awkward and maybe should exist elsewhere ?
export const JOINTS = [
	{
		type : "leg",
		anchor : "hip",
		bones : [ "leg", "hip" ],
	},
	{
		type : "arm",
		anchor : "shoulder",
		bones : [ "shoulder", "arm" ],
	},
];
