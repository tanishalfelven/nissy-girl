export const createLine = ({ pixels, movement }) => {
	let isDrawing = false;
	let snapshot = false;
	let startPos = false;
	let endPos = false;

	return {
		get active() {
			return isDrawing;
		},

		begin() {
			isDrawing = true;
		},

		stop() {
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
				startPos = movement.getRoundedPosition();

				return;
			}

			endPos = movement.getRoundedPosition();
		},

		render() {
			if(isDrawing && startPos) {
				let target = endPos || startPos;

				pixels.restore(snapshot);

				pixels.drawLine(
					startPos.x,
					startPos.y,
					target.x,
					target.y,
				);
			}

			if(!isDrawing) {
				startPos = false;
				snapshot = false;
				endPos = false;
			}
		},
	};
};
