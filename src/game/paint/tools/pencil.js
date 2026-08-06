import { COLOR_BLACK } from "$nissy-girl/screens/render.consts.js";

import { coordsDiffer } from "$game/shared/component/position.js";

export const createPencil = (world) => {
	let isDrawing = false;
	const pos = [];

	return {
		start() {
			isDrawing = true;
		},
		stop() {
			isDrawing = false;
			pos.length = 0;
		},
		hasUpdate() {
			return isDrawing || pos.length;
		},
		update() {
			if(world.cursor && isDrawing) {
				pos.push(world.cursor.getPosition());
			}
		},
		render() {
			if(isDrawing || pos.length) {
				const pixels = world.artboard.getContext();

				if(pos.length === 1) {
					pixels
						.rect(pos[0].x, pos[0].y, 1, 1)
						.fill(COLOR_BLACK);
				} else {
					for(let i = 0; i < pos.length; i++) {
						const first = pos[i];
						const second = pos[i + 1];

						if(first && second) {
							if(coordsDiffer(first, second)) {
								pixels.moveTo(first.x, first.y)
									.lineTo(second.x, second.y)
									.stroke({ color : COLOR_BLACK, pixelLine : true });
							}
						}
					}
				}

				pos.splice(0, pos.length - 2);
			}

			if(!isDrawing) {
				pos.length = 0;
			}
		},
	};
};
