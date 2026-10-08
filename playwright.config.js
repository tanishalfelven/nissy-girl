import process from "node:process";
import { defineConfig, devices } from "@playwright/test";

const isCI = Boolean(process.env.CI);

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
	testDir : ".",
	testMatch : "**/tests/**/*.spec.js",
	fullyParallel : true,
	forbidOnly : isCI,
	retries : isCI ? 2 : 0,
	workers : isCI ? 1 : undefined,
	reporter : isCI
		? [[ "github" ], [ "html", { open : "never" }]]
		: [[ "list" ], [ "html", { open : "never" }]],
	outputDir : "test-results",

	use : {
		baseURL : "http://127.0.0.1:3000",
		actionTimeout : 10_000,
		navigationTimeout : 30_000,
		trace : "retain-on-failure",
		screenshot : "only-on-failure",
		video : "retain-on-failure",
	},

	projects : [
		{
			name : "desktop-chromium",
			use : { ...devices["Desktop Chrome"] },
		},
		{
			name : "mobile-chromium",
			use : { ...devices["Pixel 5"] },
		},
		{
			name : "mobile-webkit",
			use : { ...devices["iPhone 12"] },
		},
	],

	webServer : {
		command : "npm run dev",
		url : "http://127.0.0.1:3000",
		reuseExistingServer : !isCI,
		timeout : 120_000,
	},
});
