import {
	PENCIL,
	BUCKET,
	LINE,
	NEW_ARTBOARD,
} from "../ui/tools.consts.js";

import { createPencil } from "./pencil.js";
import { createLine } from "./line.js";
import { createBucket } from "./bucket.js";
import { audio } from "$nissy-girl/sound/audio.js";

export const createTool = ({ artboard, movement }) => {
	const pixels = artboard.getContext();

	const tools = {
		[PENCIL] : createPencil({ movement, pixels }),
		[LINE] : createLine({ movement, pixels }),
		[BUCKET] : createBucket({ movement, pixels }),
	};

	let currentTool = PENCIL;

	return {
		get active() {
			return tools[currentTool].active;
		},

		selectTool(tool) {
			// new page isn't equipped
			if(tool === NEW_ARTBOARD) {
				audio.paint.playWinnie();
				artboard.clear();

				return;
			}

			if(tools[tool]) {
				audio.paint.playOinkConfirm();
				tools[currentTool].stop();
				currentTool = tool;
			}
		},

		getTool() {
			return currentTool;
		},

		begin() {
			tools[currentTool].begin();
		},

		// intentional scene lifecycle hook
		stop() {
			tools[currentTool].stop();
		},

		hasUpdate() {
			return tools[currentTool].active;
		},

		update() {
			if(!tools[currentTool].active) {
				return false;
			}

			tools[currentTool].update();
		},

		render(dt) {
			tools[currentTool].render(dt);
		},
	};
};
