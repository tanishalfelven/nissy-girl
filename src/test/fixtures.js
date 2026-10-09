import { test as base } from "@playwright/test";

import { MS } from "$util/time-string.js";

import { createAudioMock } from "./mocks/audio.mock.js";

export { expect } from "@playwright/test";

// Every test page starts on a paused clock with mocked Web Audio. Both must be in
// place before navigation, so specs only call page.goto.
export const test = base.extend({
	// Time only advances through explicit runFor calls, never with wall-clock load.
	page : async ({ page }, use) => {
		await page.clock.install({ time : 0 });
		await page.clock.pauseAt(MS);
		await use(page);
	},

	// Mocked Web Audio, so all browsers run the same audio path.
	audio : [
		async ({ page }, use) => {
			const audio = createAudioMock();

			await audio.apply(page);
			await use(audio);
		},
		{ auto : true },
	],
});
