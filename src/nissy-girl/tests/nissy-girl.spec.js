import { test } from "@playwright/test";
import { createMachine } from "xstate";
import { createTestModel } from "xstate/graph";

/**
 * Abstract browser-facing model of the NissyGirl flows under test.
 *
 * Keep this machine focused on observable app behavior. Add states for semantic
 * phases and events for user actions; bind those events to Playwright below.
 */
export const nissyGirlTestMachine = createMachine({
	id : "nissy-girl-test-model",
	initial : "device",

	states : {
		device : {
			initial : "powered off",
			states : {
				"powered off" : {
					on : {
						POWER_ON : "booting",
					},
				},

				"booting" : {
					on : {
						BOOT_COMPLETE : "powered on",
						POWER_OFF : "powered off",
					},
				},

				"powered on" : {
					on : {
						POWER_OFF : "powered off",
						START_GAME : "game",
						FOCUS_MANUAL : "#nissy-girl-test-model.manual",
					},
				},

				"game" : {
					on : {
						STOP_GAME : "powered on",
						POWER_OFF : "powered off",
						FOCUS_MANUAL : "#nissy-girl-test-model.manual",
					},
				},
			},
		},

		manual : {
			on : {
				FOCUS_DEVICE : "device.powered on",
			},
		},
	},
});

export const nissyGirlTestModel = createTestModel(nissyGirlTestMachine);
export const nissyGirlTestPaths = nissyGirlTestModel.getShortestPaths();

const pendingBinding = (name) => async () => {
	throw new Error(`Playwright binding for ${name} is not implemented`);
};

test.describe("NissyGirl model-based integration paths", () => {
	for(const path of nissyGirlTestPaths) {
		test.skip(path.description, async ({ page }) => {
			await page.goto("/");

			await path.test({
				events : {
					// TODO: Bind each model event to the matching user interaction.
					POWER_ON : pendingBinding("POWER_ON"),
					BOOT_COMPLETE : pendingBinding("BOOT_COMPLETE"),
					POWER_OFF : pendingBinding("POWER_OFF"),
					START_GAME : pendingBinding("START_GAME"),
					STOP_GAME : pendingBinding("STOP_GAME"),
					FOCUS_MANUAL : pendingBinding("FOCUS_MANUAL"),
					FOCUS_DEVICE : pendingBinding("FOCUS_DEVICE"),
				},
				states : {
					// TODO: Assert the rendered app state for each model state.
					"device.powered off" : pendingBinding("device.powered off assertion"),
					"device.booting" : pendingBinding("device.booting assertion"),
					"device.powered on" : pendingBinding("device.powered on assertion"),
					"device.game" : pendingBinding("device.game assertion"),
					"manual" : pendingBinding("manual assertion"),
				},
			});
		});
	}
});
