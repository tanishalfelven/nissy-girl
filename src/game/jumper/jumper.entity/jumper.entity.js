import { createEntity } from "$game/shared/entity/entity.js";

import { CANVAS_WIDTH, CANVAS_HEIGHT } from "$nissy-girl/screens/screen.consts.js";

import { createMovement } from "$game/shared/component/movement.component.js";
import { createInput, resolveDirectionX } from "$game/shared/component/input.component.js";

import { createPhysics } from "./physics.component.js";
import { createCollision } from "./collision.component.js";
import { BUTTON_A, DPAD_LEFT, DPAD_RIGHT } from "$game/shared/input.consts.js";
import { createJumperRender } from "./render.component.js";

export const JUMPER_INPUTS = [ DPAD_LEFT, DPAD_RIGHT, BUTTON_A ];

export const createJumper = ({
	world,
}) => {
	const width = 6;
	const height = 6;

	const movement = createMovement({
		x : CANVAS_WIDTH / 2,
		y : CANVAS_HEIGHT * 0.7,
		speed : 0.82,
	});

	const physics = createPhysics({
		movement,
	});

	const collision = createCollision({
		world,
		movement,
		physics,
		width,
		height,
	});

	const input = createInput({
		observedInputs : JUMPER_INPUTS,
		onInputChange : (inputs) => {
			const xDir = resolveDirectionX(inputs);

			movement.setDir(xDir, 0);

			physics.setJumpIntent(inputs.has(BUTTON_A));
		},
	});

	return createEntity({
		id : "jumper",
		components : {
			input,
			movement,
			physics,
			behavior : collision,
			render : createJumperRender({ movement, physics, width, height }),
		},
	});
};
