import { createEntity } from "$game/shared/entity/entity.js";

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
	const airSpeed = 0.6;
	const blastAirSpeed = 0.15;

	const width = 6;
	const height = 6;

	const platforms = world.world.get("platforms");
	const { camera } = world;

	const spawn = platforms.bounds.getSpawn();

	const movement = createMovement({
		x : spawn.x,
		y : spawn.y,
		speed : landSpeed,
	});

	camera.follow(movement);

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
		// explicitly allowing inputs buffered during startup
		inherit : true,
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
