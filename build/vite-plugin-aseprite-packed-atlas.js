import { normalizeFrame } from "./sprite.utils.js";

const asepriteAnim = "?aseprite-packed-atlas";

export default() => {
	return {
		name : "aseprite-packed-atlas",
		transform : {
			handler(code, id) {
				if(!id.includes(asepriteAnim)) {
					return false;
				}

				const sheetData = JSON.parse(code);

				for(const frame of Object.values(sheetData.frames)) {
					normalizeFrame(frame);
				}

				return {
					code : `export default ${JSON.stringify(sheetData)};`,
					map : null,
				};
			},
		},
	};
};
