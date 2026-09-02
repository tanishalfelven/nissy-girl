import { coordsDiffer } from "$game/shared/component/position.js";
import { audio } from "$nissy-girl/sound/audio.js";

export const pointToString = ({ x, y }) => `${Math.floor(x)},${Math.floor(y)}`;

export const createPencil = ({ pixels, movement }) => {
	let isDrawing = false;
	const pos = [];
	const deadStack = new Set();

	return {
		get active() {
			return isDrawing;
		},

		begin() {
			audio.paint.playScribble();
			isDrawing = true;
		},

		// intentional scene lifecycle hook
		stop() {
			isDrawing = false;
			pos.length = 0;
			deadStack.clear();
		},

		update() {
			if(!isDrawing) {
				return false;
			}

			const nextPos = movement.getPosition();

			if(deadStack.size > 0 && deadStack.has(pointToString(nextPos))) {
				return;
			}

			if(pos.length === 0 || coordsDiffer(nextPos, pos.at(-1))) {
				pos.push(nextPos);
			}
		},

		render() {
			if(isDrawing && pos.length) {
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

				const paintedPoints = pos.splice(0, Math.max(pos.length - 1, 1));

				for(const point of paintedPoints) {
					deadStack.add(pointToString(point));
				}

				audio.paint.playScribble();
			}

			if(!isDrawing) {
				pos.length = 0;
			}
		},
	};
};
