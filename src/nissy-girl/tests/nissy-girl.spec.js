import { assign, createMachine, raise, stateIn } from "xstate";
import { createTestModel } from "xstate/graph";

import { MS } from "$util/time-string.js";

import { expect, test } from "../../test/fixtures.js";
import {
	alignLure,
	DIRECTION,
	enterBack,
	exitBack,
	FACE,
	FACE_MARGIN,
	pressPowerSwitch,
	pullCartridgeUp,
	pushCartridgeDown,
	readAngleFromFace,
	readCartridgePosition,
	readDeviceRotation,
	swipeCartridge,
	turnQuarter,
} from "./gesture-helpers.js";
import { expectPlaysOnce, playCount, SFX } from "./sfx-helpers.js";

// The carousel latches its browse direction from the entry swipe that glides the
// first cartridge in. Entering with a cartridge inserted skips the carousel, so
// the latched side is kept.
const latchEntry = (side) => {
	return assign({
		entry : ({ context }) => {
			return context.cartridge === "none" ? side : context.entry;
		},
	});
};

// Browsing in the entry direction moves forward through the cartridges.
const enteredFrom = (side) => {
	return ({ context }) => {
		return context.entry === side;
	};
};

const nissyGirlTestMachine = createMachine({
	id : "nissy-girl",

	context : {
		cartridge : "none",
		entry : "none",
	},

	initial : "lure",

	states : {
		lure : {
			on : {
				ALIGN_LURE : "nissygirl",
			},
		},

		nissygirl : {
			type : "parallel",

			states : {
				device : {
					type : "parallel",

					states : {
						powered : {
							initial : "off",

							states : {
								off : {
									on : {
										POWER_TOGGLE : "on",
									},
								},

								on : {
									initial : "booting",

									states : {
										booting : {
											on : {
												BOOT_COMPLETE : "poweredOn",

												POWER_TOGGLE : {
													target : "#nissy-girl.nissygirl.device.powered.off",
													actions : raise({ type : "GAME_STOP" }),
												},
											},
										},

										poweredOn : {
											on : {
												START_GAME : {
													guard : stateIn("#nissy-girl.nissygirl.device.cartridge.inserted.booting"),
													actions : raise({ type : "GAME_START" }),
												},

												POWER_TOGGLE : {
													target : "#nissy-girl.nissygirl.device.powered.off",
													actions : raise({ type : "GAME_STOP" }),
												},
											},
										},
									},
								},
							},
						},

						cartridge : {
							initial : "ejected",

							states : {
								ejected : {
									on : {
										INSERT_JUMPER : [
											{
												guard : stateIn("#nissy-girl.nissygirl.device.powered.on"),
												target : "inserted.stalled",
												actions : assign({ cartridge : "jumper" }),
											},
											{
												target : "inserted.off",
												actions : assign({ cartridge : "jumper" }),
											},
										],

										INSERT_PAINT : [
											{
												guard : stateIn("#nissy-girl.nissygirl.device.powered.on"),
												target : "inserted.stalled",
												actions : assign({ cartridge : "paint" }),
											},
											{
												target : "inserted.off",
												actions : assign({ cartridge : "paint" }),
											},
										],
									},
								},

								inserted : {
									initial : "off",

									states : {
										off : {
											on : {
												POWER_TOGGLE : "booting",
											},
										},

										// Powered on with the cartridge in, so the console boots into its game.
										booting : {
											on : {
												GAME_START : "playing",
												GAME_STOP : "off",

												EJECT_CARTRIDGE : {
													target : "#nissy-girl.nissygirl.device.cartridge.ejected",

													actions : [
														assign({ cartridge : "none" }),
														raise({ type : "POWER_TOGGLE" }),
													],
												},
											},
										},

										playing : {
											on : {
												GAME_STOP : "off",

												EJECT_CARTRIDGE : {
													target : "#nissy-girl.nissygirl.device.cartridge.ejected",

													actions : [
														assign({ cartridge : "none" }),
														raise({ type : "POWER_TOGGLE" }),
													],
												},
											},
										},

										// Inserted after boot, so the console never sees it until power cycled.
										stalled : {
											on : {
												GAME_STOP : "off",
											},
										},
									},

									on : {
										EJECT_CARTRIDGE : {
											target : "#nissy-girl.nissygirl.device.cartridge.ejected",
											actions : assign({ cartridge : "none" }),
										},
									},
								},
							},
						},
					},
				},

				// ROTATE_* names the direction of the device's turn, not the side in view.
				camera : {
					initial : "front",

					states : {
						left : {
							on : {
								ROTATE_RIGHT : "front",

								ENTER_BACK_LEFT : {
									target : "back",
									actions : latchEntry("left"),
								},
							},
						},

						front : {
							on : {
								ROTATE_LEFT : "left",
								ROTATE_RIGHT : "right",
							},
						},

						back : {
							on : {
								TO_LEFT : "left",
								TO_RIGHT : "right",
							},

							initial : "choose",

							states : {
								choose : {
									always : [
										{
											guard : ({ context }) => {
												return context.cartridge === "none";
											},

											target : "selecting.paint",
										},
										{
											guard : ({ context }) => {
												return context.cartridge === "paint";
											},

											target : "inserted.paint",
										},
										{
											guard : ({ context }) => {
												return context.cartridge === "jumper";
											},

											target : "inserted.jumper",
										},
									],
								},

								// both of these mean you've fully 360'd the console, so reflecting that direction
								none : {
									on : {
										EXIT_LEFT : { actions : raise({ type : "TO_RIGHT" }) },
										EXIT_RIGHT : { actions : raise({ type : "TO_LEFT" }) },
									},
								},

								inserted : {
									initial : "paint",

									on : {
										EXIT_LEFT : { actions : raise({ type : "TO_RIGHT" }) },
										EXIT_RIGHT : { actions : raise({ type : "TO_LEFT" }) },
										SELECTING_PAINT : "selecting.paint",
										SELECTING_JUMPER : "selecting.jumper",
									},

									states : {
										paint : {
											on : {
												GESTURE_CARTRIDGE_UP : {
													actions : [
														raise({ type : "EJECT_CARTRIDGE" }),
														raise({ type : "SELECTING_PAINT" }),
													],
												},
											},
										},

										jumper : {
											on : {
												GESTURE_CARTRIDGE_UP : {
													actions : [
														raise({ type : "EJECT_CARTRIDGE" }),
														raise({ type : "SELECTING_JUMPER" }),
													],
												},
											},
										},
									},
								},

								selecting : {
									on : {
										NONE : "none",
									},

									initial : "paint",

									states : {
										paint : {
											on : {
												BROWSE_LEFT : [
													{ guard : enteredFrom("left"), target : "jumper" },
													{ actions : raise({ type : "NONE" }) },
												],

												BROWSE_RIGHT : [
													{ guard : enteredFrom("right"), target : "jumper" },
													{ actions : raise({ type : "NONE" }) },
												],

												GESTURE_CARTRIDGE_DOWN : {
													target : "#nissy-girl.nissygirl.camera.back.inserted.paint",
													actions : raise({ type : "INSERT_PAINT" }),
												},
											},
										},

										jumper : {
											on : {
												BROWSE_LEFT : [
													{ guard : enteredFrom("left"), actions : raise({ type : "NONE" }) },
													{ target : "paint" },
												],

												BROWSE_RIGHT : [
													{ guard : enteredFrom("right"), actions : raise({ type : "NONE" }) },
													{ target : "paint" },
												],

												GESTURE_CARTRIDGE_DOWN : {
													target : "#nissy-girl.nissygirl.camera.back.inserted.jumper",
													actions : raise({ type : "INSERT_JUMPER" }),
												},
											},
										},
									},
								},
							},
						},

						right : {
							on : {
								ROTATE_LEFT : "front",

								ENTER_BACK_RIGHT : {
									target : "back",
									actions : latchEntry("right"),
								},

								GESTURE_POWER_TOGGLE : {
									actions : raise({ type : "POWER_TOGGLE" }),
								},
							},
						},
					},
				},
			},
		},
	},
});

const EVENT = {
	ALIGN_LURE : { type : "ALIGN_LURE" },
	GESTURE_POWER_TOGGLE : { type : "GESTURE_POWER_TOGGLE" },
	GESTURE_CARTRIDGE_DOWN : { type : "GESTURE_CARTRIDGE_DOWN" },
	GESTURE_CARTRIDGE_UP : { type : "GESTURE_CARTRIDGE_UP" },
	ROTATE_LEFT : { type : "ROTATE_LEFT" },
	ROTATE_RIGHT : { type : "ROTATE_RIGHT" },
	ENTER_BACK_LEFT : { type : "ENTER_BACK_LEFT" },
	ENTER_BACK_RIGHT : { type : "ENTER_BACK_RIGHT" },
	EXIT_LEFT : { type : "EXIT_LEFT" },
	EXIT_RIGHT : { type : "EXIT_RIGHT" },
	BROWSE_LEFT : { type : "BROWSE_LEFT" },
	BROWSE_RIGHT : { type : "BROWSE_RIGHT" },
	BOOT_COMPLETE : { type : "BOOT_COMPLETE" },
	START_GAME : { type : "START_GAME" },
};

const events = Object.values(EVENT);

// Journeys that return to a state shortest paths already reach by a shorter
// route, so state coverage alone never takes them.
const scenarios = [
	// Pulling a running game's cartridge powers the device off.
	[
		EVENT.ALIGN_LURE,
		EVENT.ROTATE_LEFT,
		EVENT.ENTER_BACK_LEFT,
		EVENT.GESTURE_CARTRIDGE_DOWN,
		EVENT.EXIT_LEFT,
		EVENT.GESTURE_POWER_TOGGLE,
		EVENT.ENTER_BACK_RIGHT,
		EVENT.BOOT_COMPLETE,
		EVENT.START_GAME,
		EVENT.GESTURE_CARTRIDGE_UP,
	],
];

// A state is its value and context. The default also keys by incoming transition,
// which multiplies paths across the parallel regions and admits unhandled events.
const serializeState = (state) => {
	return JSON.stringify([ state.value, state.context ]);
};

const model = createTestModel(nissyGirlTestMachine);

const paths = model.getShortestPaths({ events, serializeState });

for(const scenario of scenarios) {
	paths.push(...model.getPathsFromEvents(scenario, { serializeState }));
}

test.describe("NissyGirl model-based integration paths", () => {
	for(const path of paths) {
		test(path.description, async ({ page, audio }) => {
			await page.goto("/");

			await path.test({
				events : {
					ALIGN_LURE : async () => {
						await alignLure(page);
					},

					GESTURE_POWER_TOGGLE : async () => {
						await expectPlaysOnce(audio, [ SFX.powerToggle ], () => pressPowerSwitch(page));
					},

					GESTURE_CARTRIDGE_DOWN : async () => {
						await expectPlaysOnce(audio, [ SFX.cartridgeInsert, SFX.cartridgeScrape ], () => pushCartridgeDown(page));
					},

					GESTURE_CARTRIDGE_UP : async () => {
						await expectPlaysOnce(audio, [ SFX.cartridgeRemove ], () => pullCartridgeUp(page));
					},

					ROTATE_LEFT : async () => {
						await turnQuarter(page, { direction : DIRECTION.left });
					},

					ROTATE_RIGHT : async () => {
						await turnQuarter(page, { direction : DIRECTION.right });
					},

					ENTER_BACK_LEFT : async () => {
						await enterBack(page, { direction : DIRECTION.left });
					},

					ENTER_BACK_RIGHT : async () => {
						await enterBack(page, { direction : DIRECTION.right });
					},

					EXIT_LEFT : async () => {
						await exitBack(page, { direction : DIRECTION.left });
					},

					EXIT_RIGHT : async () => {
						await exitBack(page, { direction : DIRECTION.right });
					},

					BROWSE_LEFT : async () => {
						await swipeCartridge(page, { direction : DIRECTION.left });
					},

					BROWSE_RIGHT : async () => {
						await swipeCartridge(page, { direction : DIRECTION.right });
					},

					BOOT_COMPLETE : async () => {
						await page.clock.runFor(MS / 2);
					},

					START_GAME : async () => {
						await page.clock.runFor(MS * 4);
					},
				},

				states : {
					"lure" : async () => {
						await expect(page.getByTestId("device")).toBeVisible();
						await page.clock.runFor(MS);
					},

					"nissygirl.device.powered.off" : async () => {
						await expect(page.getByTestId("power-switch")).toHaveAttribute("data-power", "false");
						await expect(page.getByTestId("startup-screen")).toBeHidden();
					},

					"nissygirl.device.powered.on.booting" : async () => {
						await expect(page.getByTestId("power-switch")).toHaveAttribute("data-power", "true");
					},

					"nissygirl.device.powered.on.poweredOn" : async () => {
						await expect(page.getByTestId("power-switch")).toHaveAttribute("data-power", "true");

						// Boot reached its startup screen, which plays the jingle.
						await expect.poll(() => playCount(audio, SFX.bootJingle)).toBeGreaterThan(0);
					},

					"nissygirl.device.cartridge.ejected" : async () => {
						await expect(page.getByTestId("device")).toHaveAttribute("data-cartridge", "false");
					},

					"nissygirl.device.cartridge.inserted" : async () => {
						await expect(page.getByTestId("device")).not.toHaveAttribute("data-cartridge", "false");
					},

					"nissygirl.device.cartridge.inserted.stalled" : async () => {
						await expect(page.getByTestId("startup-screen")).toBeVisible();
					},

					// Only a powered device plays, so a running game has replaced the startup screen.
					"nissygirl.device.cartridge.inserted.playing" : async () => {
						await expect(page.getByTestId("power-switch")).toHaveAttribute("data-power", "true");
						await expect(page.getByTestId("startup-screen")).toBeHidden();
					},

					"nissygirl.camera.left" : async () => {
						expect(await readAngleFromFace(page, { face : FACE.left })).toBeLessThan(FACE_MARGIN);
					},

					"nissygirl.camera.front" : async () => {
						expect(await readAngleFromFace(page, { face : FACE.front })).toBeLessThan(FACE_MARGIN);
					},

					"nissygirl.camera.right" : async () => {
						expect(await readAngleFromFace(page, { face : FACE.right })).toBeLessThan(FACE_MARGIN);
					},

					"nissygirl.camera.back" : async () => {
						expect(await readDeviceRotation(page)).toBe(FACE.back);
					},

					"nissygirl.camera.back.none" : async () => {
						await expect(page.getByTestId("active-cartridge")).toBeHidden();
					},

					"nissygirl.camera.back.inserted" : async () => {
						expect(await readCartridgePosition(page, { axis : "y" })).toBe(1);
					},

					"nissygirl.camera.back.inserted.paint" : async () => {
						await expect(page.getByTestId("device")).toHaveAttribute("data-cartridge", "paint");
					},

					"nissygirl.camera.back.inserted.jumper" : async () => {
						await expect(page.getByTestId("device")).toHaveAttribute("data-cartridge", "jumper");
					},

					// The offered cartridge rests over the slot, ready to insert.
					"nissygirl.camera.back.selecting" : async () => {
						expect(await readCartridgePosition(page, { axis : "x" })).toBe(0.5);
						expect(await readCartridgePosition(page, { axis : "y" })).toBe(0);
					},

					"nissygirl.camera.back.selecting.paint" : async () => {
						await expect(page.getByTestId("active-cartridge").locator("[data-cartridge=paint]")).toBeVisible();
					},

					"nissygirl.camera.back.selecting.jumper" : async () => {
						await expect(page.getByTestId("active-cartridge").locator("[data-cartridge=jumper]")).toBeVisible();
					},
				},
			});
		});
	}
});
