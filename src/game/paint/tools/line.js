import { audio } from "$nissy-girl/sound/audio.js";
import { coordsDiffer } from "$game/shared/component/position.js";

const floorPoint = ({ x, y }) => ({ x : Math.floor(x), y : Math.floor(y) });

export const createLine = ({ pixels, movement }) => {
	let isDrawing = false;
	let snapshot = false;
	let startPos = false;
	let endPos = false;
	let lastPos = false;

	return {
		get active() {
			return isDrawing;
		},

		begin() {
			isDrawing = true;
			audio.paint.playLineStart();
		},

		stop() {
			if(isDrawing) {
				audio.paint.playLineEnd();
			}

			isDrawing = false;
			startPos = false;
			endPos = false;
			snapshot = false;
		},

		update() {
			if(!isDrawing) {
				return false;
			}

			if(!startPos) {
				snapshot = pixels.snapshot();
				startPos = floorPoint(movement.getPosition());

				return;
			}

			endPos = floorPoint(movement.getPosition());
		},

		render() {
			if(!isDrawing) {
				startPos = false;
				snapshot = false;
				endPos = false;
				return;
			}

			if(startPos) {
				let target = endPos || startPos;

				pixels.restore(snapshot);

				pixels.drawLine(
					startPos.x,
					startPos.y,
					target.x,
					target.y,
				);

				if(coordsDiffer(lastPos, endPos) && isDrawing) {
					audio.paint.playLineContinue();
				}

				lastPos = endPos;
			}
		},
	};
};
