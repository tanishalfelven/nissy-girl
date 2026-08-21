import { createEntity } from "$game/shared/entity/entity.js";

import { CANVAS_WIDTH, CANVAS_HEIGHT } from "$nissy-girl/screens/screen.consts.js";

import { createMovement } from "$game/shared/component/movement.component.js";
import { createInput, resolveDirectionX } from "$game/shared/component/input.component.js";
import { createBehavior } from "./behavior.component.js";

import { createPhysics } from "./physics.component.js";
import {
	BUTTON_A,
	DPAD_DOWN,
	DPAD_LEFT,
	DPAD_RIGHT,
} from "$game/shared/input.consts.js";
import { createJumperRender } from "./render.component.js";

export const JUMPER_INPUTS = [ DPAD_LEFT, DPAD_RIGHT, DPAD_DOWN, BUTTON_A ];

export const createJumper = ({
	world,
}) => {
	const landSpeed = 0.9;
	const airSpeed = 0.45;
	const blastAirSpeed = 0.15;

	const width = 6;
	const height = 6;

	const movement = createMovement({
		x : CANVAS_WIDTH / 2,
		y : CANVAS_HEIGHT * 0.7,
		speed : landSpeed,
	});

	const physics = createPhysics({
		movement,
	});

	const behavior = createBehavior({
		world,
		movement,
		physics,
		width,
		height,
		landSpeed,
		airSpeed,
		blastAirSpeed,
	});

	const input = createInput({
		observedInputs : JUMPER_INPUTS,
		onInputChange : (inputs) => {
			const xDir = resolveDirectionX(inputs);

			movement.setDir(xDir, 0);

			behavior.setJumpIntent(inputs.has(BUTTON_A));
			behavior.setCrouchIntent(inputs.has(DPAD_DOWN));
		},
	});

	return createEntity({
		id : "jumper",
		components : {
			input,
			movement,
			physics,
			behavior,
			render : createJumperRender({ world, movement, physics, behavior, width, height }),
		},
	});
};
