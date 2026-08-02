import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./screen.consts.js";
import { createRenderer } from "./render.js";
import { createLazyActor } from "$util/create-lazy-actor.js";

export const screenRuntime = createLazyActor({
	id : "screen",
	start(canvas, { receive, sendBack }) {
		const renderer = createRenderer(canvas, { width : CANVAS_WIDTH, height : CANVAS_HEIGHT });

		sendBack({ type : "RENDERER_READY" });

		receive((event) => {
			console.log(event);
		});

		return () => {
			// cleanup
		};
	},
});
