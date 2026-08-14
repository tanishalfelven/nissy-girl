import { coordsDiffer } from "$game/shared/component/position.js";

export const createPencil = ({ artboard, movement }) => {
	let isDrawing = false;
	const pos = [];
	const pixels = artboard.getContext();

	// this definitely needs to come from something else!
	const xOffset = 2;
	const yOffset = 2;

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
					const x = pos[0].x + xOffset;
					const y = pos[0].y + yOffset;

					pixels
						.drawLine(
							x,
							y,
							x,
							y,
						);
				} else {
					for(let i = 0; i < pos.length; i++) {
						const first = pos[i];
						const second = pos[i + 1];

						if(first && second) {
							if(coordsDiffer(first, second)) {
								pixels.drawLine(
									first.x + xOffset,
									first.y + yOffset,
									second.x + xOffset,
									second.y + yOffset,
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
