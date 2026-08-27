import { input as globalInputState } from "$nissy-girl/input.js";
import { DPAD_DOWN, DPAD_LEFT, DPAD_RIGHT, DPAD_UP } from "$game/shared/input.consts.js";

export const ALL_AXIS = [ DPAD_LEFT, DPAD_RIGHT, DPAD_UP, DPAD_DOWN ];
export const VERT_AXIS = [ DPAD_UP, DPAD_DOWN ];
export const HORZ_AXIS = [ DPAD_LEFT, DPAD_RIGHT ];

export const DIRECTION = new Map([
	[ DPAD_LEFT, -1 ],
	[ DPAD_RIGHT, 1 ],
	[ DPAD_UP, -1 ],
	[ DPAD_DOWN, 1 ],
]);

const resolveDirection = (axis) => (inputs) => {
	let dir = 0;

	for(const inputType of axis) {
		if(inputs.has(inputType)) {
			dir += DIRECTION.get(inputType);
		}
	}

	return dir;
};

export const resolveDirectionY = resolveDirection(VERT_AXIS);
export const resolveDirectionX = resolveDirection(HORZ_AXIS);

export const createInput = ({
	observedInputs = ALL_AXIS,
	onInputChange,

	// receive inputs held prior to taking over handling
	// ! Input is generally wiped when input unmounts, this only works if input has not been actively handled
	// ! Prior to taking direct control
	inherit = false,
}) => {
	const inputs = new Set();

	return {
		inherit,

		handleInput() {
			let didInputChange = false;

			for(const inputType of observedInputs) {
				const globalInputPressed = globalInputState.state[inputType];
				const localInputPressed = inputs.has(inputType);

				if(globalInputPressed && !localInputPressed) {
					didInputChange = true;

					inputs.add(inputType);
				} else if(!globalInputPressed && localInputPressed) {
					didInputChange = true;

					inputs.delete(inputType);
				}
			}

			if(didInputChange) {
				onInputChange(inputs);
			}

			return didInputChange;
		},

		stopInput() {
			if(inputs.size === 0) {
				return;
			}

			inputs.clear();
			onInputChange(inputs);
		},
	};
};
