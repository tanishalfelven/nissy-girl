export const createCollision = ({
	world,
	movement,
	physics,
	width,
	height,
}) => {
	let isGrounded = false;

	return {
		hasUpdate() {
			return movement.isMoving() || physics.isMoving();
		},

		update() {
			isGrounded = false;

			const startX = movement.getLastX();
			const targetX = movement.getX() + physics.getDeltaX();

			const startY = movement.getLastY();
			const targetY = movement.getY() + physics.getDeltaY();

			const result = world.world.getValidPosition(
				startX,
				targetX,
				startY,
				targetY,
				width,
				height,
			);

			if(targetX !== movement.getX()) {
				movement.setX(result.x);

				if(targetX !== result.x) {
					physics.cancelX();
				}
			}

			if(targetY !== movement.getY()) {
				movement.setY(result.y);

				if(targetY !== result.y) {
					isGrounded = true;
					physics.cancelY();
				}
			}

			physics.setGrounded(isGrounded);
		},
	};
};
