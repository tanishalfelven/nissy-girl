import { TYPE_RGBA } from "$nissy-girl/screens/render.consts.js";

import cursorUrl from "./assets/cursor.png";

/**
 * @returns {import("$games/shared/entity/scene.entity.js").Entity}
 */
export const createCursor = () => {
	const x = 50;
	const y = 50;

	let sprites;

	return {
		id : "cursor",
		start() {},
		stop() {},
		hasUpdate() {},
		update() {},
		getSpriteRequests() {
			return { cursor : cursorUrl };
		},
		setSprites(resolvedSprites) {
			sprites = resolvedSprites;
		},
		getRenderable() {
			return {
				id : "cursor",
				x,
				y,
				type : TYPE_RGBA,
				imageData : sprites.cursor.getCurrentFrame(),
				dirty : null,
			};
		},
	};
};
