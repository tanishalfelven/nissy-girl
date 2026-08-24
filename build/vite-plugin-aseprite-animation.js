const asepriteAnim = "?aseprite-animation";

/**
 * Expectations
 * - Frames are named by frame index only
 * - Individual animations are marked with a tag
 *
 */

export default() => {
	return {
		name : "aseprite-animation",
		transform : {
			handler(code, id) {
				if(!id.includes(asepriteAnim)) {
					return false;
				}

				const sheetData = JSON.parse(code);

				const animations = {};
				const frameData = [];

				for(const tag of sheetData.meta.frameTags) {
					const animation = [];

					for(let frameIndex = tag.from; frameIndex < tag.to; frameIndex++) {
						const frame = sheetData.frames[frameIndex];

						frameData.push({ name : tag.name, texture : frameIndex, time : frame.duration });
						animation.push(frameIndex);
					}

					animations[tag.name] = animation;
				}

				sheetData.animations = animations;
				sheetData.frameData = frameData;

				return {
					code : `export default ${JSON.stringify(sheetData)};`,
					map : null,
				};
			},
		},
	};
};
