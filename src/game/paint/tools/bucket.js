export const createBucket = ({ pixels, movement }) => {
	let isFilling = false;
	let pos = false;

	return {
		get active() {
			return isFilling;
		},

		begin() {
			isFilling = true;
		},

		stop() {
			pos = false;
			isFilling = false;
		},

		update() {
			if(!isFilling) {
				return false;
			}

			pos = movement.getPosition();
		},

		render() {
			if(isFilling && pos) {
				pixels.floodFill(pos.x, pos.y);

				isFilling = false;
				pos = false;
			}
		},
	};
};
