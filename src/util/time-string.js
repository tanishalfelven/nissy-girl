export const MS = 1000;
export const MS_IN_MIN = 60 * MS;

const padStart = (n, len) => String(n).padStart(len, "0");

/**
 * given time input return 00:00.0000
 * @param {number} time
 * @returns {string}
 */
export const toString = (time) => {
	const ms = Math.floor((time % MS) / 100);
	const s = Math.floor(time / MS) % 60;
	const min = Math.floor(time / MS_IN_MIN);

	return `${padStart(min, 2)}:${padStart(s, 2)}.${padStart(ms, 1)}`;
};
