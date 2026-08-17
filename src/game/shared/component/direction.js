export const createDirection = () => {
	let dirX = 0;
	let dirY = 0;

	const setX = (dir) => {
		if(dir === dirX) {
			return false;
		}

		dirX = dir;

		return true;
	};

	const setY = (dir) => {
		if(dir === dirY) {
			return false;
		}

		dirY = dir;

		return true;
	};

	return {
		setX,

		setY,

		getX : () => dirX,
		getY : () => dirY,

		isMoving : () => dirX !== 0 || dirY !== 0,

		set(newDirX, newDirY) {
			const xChanged = setX(newDirX);
			const yChanged = setY(newDirY);

			return xChanged || yChanged;
		},
	};
};
