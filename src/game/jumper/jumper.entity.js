import { createEntity } from "$game/shared/entity/entity.js";

import { CANVAS_WIDTH, CANVAS_HEIGHT } from "$nissy-girl/screens/screen.consts.js";

import { createMovement } from "$game/shared/component/movement.js";

export const createJumper = ({
	world,
}) => {
	const movement = createMovement({
		x : CANVAS_WIDTH / 2,
		y : CANVAS_HEIGHT / 2,
		speed : 1,
	});

	return createEntity({
		id : "jumper",
		components : {
			movement,
			render : {

			},
		},
	});
};
