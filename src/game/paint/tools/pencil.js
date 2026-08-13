import { COLOR_BLACK } from "$nissy-girl/screens/render.consts.js";

import { coordsDiffer } from "$game/shared/component/position.js";

export const createPencil = ({ artboard, movement }) => {
	let isDrawing = false;
	const pos = [];

	// this definitely needs to come from something else!
	const xOffset = 2;
	const yOffset = 2;

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

			const nextPos = movement.getPosition();

			if(pos.length === 0 || coordsDiffer(nextPos, pos.at(-1))) {
				pos.push(nextPos);
			}
		},

		render() {
			if(isDrawing || pos.length) {
				const pixels = artboard.getContext();

				if(pos.length === 1) {
					pixels
						.rect(pos[0].x + xOffset, pos[0].y + yOffset, 1, 1)
						.fill(COLOR_BLACK);
				} else {
					for(let i = 0; i < pos.length; i++) {
						const first = pos[i];
						const second = pos[i + 1];

						if(first && second) {
							if(coordsDiffer(first, second)) {
								pixels.moveTo(first.x + xOffset, first.y + yOffset)
									.lineTo(second.x + xOffset, second.y + yOffset)
									.stroke({ color : COLOR_BLACK, width : 1, cap : "butt", join : "miter" });
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
