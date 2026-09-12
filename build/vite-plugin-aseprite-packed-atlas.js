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
					const { w, h } = frame.frame;

					frame.trimmed = false;

					frame.spriteSourceSize = {
						x : 0,
						y : 0,
						w,
						h,
					};

					frame.sourceSize = {
						w,
						h,
					};
				}

				return {
					code : `export default ${JSON.stringify(sheetData)};`,
					map : null,
				};
			},
		},
	};
};
