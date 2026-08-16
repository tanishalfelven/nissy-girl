import { coordsDiffer } from "$game/shared/component/position.js";

export const createPencil = ({ pixels, movement }) => {
	let isDrawing = false;
	const pos = [];

	return {
		get active() {
			return isDrawing;
		},

		begin() {
			isDrawing = true;
		},

		// intentional scene lifecycle hook
		stop() {
			isDrawing = false;
			pos.length = 0;
		},

		hasUpdate() {
			return isDrawing && movement.isMoving();
		},

		update() {
			if(!isDrawing) {
				return false;
			}

			const nextPos = movement.getRoundedPosition();

			if(pos.length === 0 || coordsDiffer(nextPos, pos.at(-1))) {
				pos.push(nextPos);
			}
		},

		render() {
			if(isDrawing || pos.length) {
				for(let i = 0; i < pos.length; i++) {
					const first = pos[i];
					const second = pos[i + 1] || first;

					pixels.drawLine(
						first.x,
						first.y,
						second.x,
						second.y,
					);
				}

				pos.splice(0, pos.length - 1);
			}

			if(!isDrawing) {
				pos.length = 0;
			}
		},
	};
};
