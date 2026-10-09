import { defineConfig } from "@playwright/test";

import config from "./playwright.config.js";

/**
 * This whole thing is a bit of a horror show - we need to test webkit on dev machines and I use windows..
 * We do that directly by kicking off a wsl playwright server.
 */
const WSL_SERVER_PORT = 3334;

export default defineConfig(config, {
	use : {
		connectOptions : {
			wsEndpoint : `ws://127.0.0.1:${WSL_SERVER_PORT}/`,

			exposeNetwork : "<loopback>",
		},
	},

	webServer : {
		command : `wsl.exe -e bash -ic "npx playwright run-server --port ${WSL_SERVER_PORT} --host 127.0.0.1"`,
		port : WSL_SERVER_PORT,
		reuseExistingServer : true,
		timeout : 120_000,
	},
});
