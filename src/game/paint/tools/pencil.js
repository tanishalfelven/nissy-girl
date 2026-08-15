import { coordsDiffer } from "$game/shared/component/position.js";

export const createPencil = ({ artboard, movement }) => {
	let isDrawing = false;
	const pos = [];
	const pixels = artboard.getContext();

	return {
		get active() {
			return isDrawing;
		},

		begin() {
			isDrawing = true;
			pixels.commit();
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

			const nextPos = movement.getPosition();

			if(pos.length === 0 || coordsDiffer(nextPos, pos.at(-1))) {
				pos.push(nextPos);
			}
		},

		render() {
			if(isDrawing || pos.length) {
				if(pos.length === 1) {
					const x = pos[0].x;
					const y = pos[0].y;

					pixels.drawLine(x, y, x, y);
				} else {
					for(let i = 0; i < pos.length; i++) {
						const first = pos[i];
						const second = pos[i + 1];

						if(first && second) {
							if(coordsDiffer(first, second)) {
								pixels.drawLine(
									first.x,
									first.y,
									second.x,
									second.y,
								);
							}
						}
					}
				}

				pos.splice(0, pos.length - 1);
			}

			if(!isDrawing) {
				pos.length = 0;
			}
		},
	};
};
