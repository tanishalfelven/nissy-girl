import {
	createMachine,
	sendTo,
	raise,
	sendParent,
} from "xstate";

import {
	createReleaseVelocity,
	ROTATE_VELOCITYID,
	VERT_VELOCITYID,
} from "$util/release-velocity.actor.js";
import {
	cartridges,
	cartridgeX,
	cartridgeY,
} from "$nissy-girl/cartridge/cartridge.viewmodel.svelte.js";

import { hasParams } from "$util/params.js";

import { audio } from "./sound/audio.js";

import {
	camera,
	rotation,
	zoom,
} from "./camera.viewmodel.svelte.js";
import { nissyGirl } from "./nissy-girl.viewmodel.svelte.js";

import { stateLogger } from "$util/state-logger.actor.js";
import { crossedThreshold } from "$util/math.js";
import { getAnimateProgress } from "$util/animate-progress.js";
import {
	invokePromptLayer,
	CARTRIDGE_INSERT,
	CARTRIDGE_EJECT,
	ROTATE,
	POWER_OFF,
	POWER_ON,
} from "./prompts/prompts.svelte";

const updateVelocityTarget = (target, progress) =>
	sendTo(target, { type : "NEW_TARGET", progress });

export const cameraMachine = createMachine({
	id : "camera",

	invoke : [
		createReleaseVelocity(ROTATE_VELOCITYID, "ROTATE_SWIPE"),
		stateLogger,
	],

	on : {
		DRAG_START : {
			actions : sendTo(ROTATE_VELOCITYID, { type : "DRAG_START" }),
		},

		DRAG_END : {
			actions : sendTo(ROTATE_VELOCITYID, { type : "DRAG_END" }),
		},

		DRAG_DELTA : {
			actions : sendTo(ROTATE_VELOCITYID, ({ event }) => event),
		},
	},

	initial : "decide",

	states : {
		"decide" : {
			always : [
				{
					// Eventually we guard this around FTUE not just has url param
					guard : () => hasParams(),
					target : "playing",
				},
				{
					target : "lure",
				},
			],
		},

		"lure" : {
			invoke : {
				id : "rotation-lure",
				src : getAnimateProgress({
					duration : 4000,
					steps : [ 0, -0.2, 0.1, -0.05, 0.022, 0 ],
					// reverse direction each time we play
					modify : (steps) => steps.map((step) => -step),
					progress : rotation,
				}),
			},

			after : {
				6500 : {
					reenter : true,
					target : "lure",
				},
			},

			on : {
				DRAG_START : "playing",
			},
		},

		"playing" : {
			entry : updateVelocityTarget(ROTATE_VELOCITYID, rotation),

			on : {
				ROTATE_SWIPE : [
					{
						guard : ({ event }) => {
							// Zoom angle must be rotated into to start, not away
							if(camera.isCurrentlyAtZoomAngle()) {
								return false;
							}

							return camera.enteringZoomAngle(event.delta);
						},
						target : "zooming",
					},
					{
						actions : ({ event }) => {
							rotation.update(event.delta);

							// prepares us to re-enter cartridge scroll
							camera.clearReturningFromCartridgeFlow();

							if(!nissyGirl.hasInsertedCartridge()) {
								cartridges.setDirection(Math.sign(event.delta));
							}
						},
					},
				],
			},
		},

		"zooming" : {
			entry : updateVelocityTarget(ROTATE_VELOCITYID, zoom),

			on : {
				CART_DRAG_START : {
					actions : raise({ type : "TEST_ZOOM_BOUNDS" }),
				},

				CART_DRAG_DELTA : {
					actions : raise(({ event }) => ({ type : "HANDLE_DRAG", delta : event.delta })),
				},

				ROTATE_SWIPE : {
					actions : raise(({ event }) => ({ type : "HANDLE_DRAG", delta : event.delta })),
				},

				HANDLE_DRAG : {
					actions : [
						({ event }) => zoom.update(event.delta),
						raise({ type : "TEST_ZOOM_BOUNDS" }),
					],
				},

				TEST_ZOOM_BOUNDS : [
					{
						guard : () => camera.isMaxZoomedOut(),
						actions : raise({ type : "SCROLL_AT_MAX_CARTRIDGE_SELECT" }),
					},
					{
						guard : () => camera.isMaxZoomedIn(),
						target : "playing",
					},
				],

				SCROLL_AT_MAX_CARTRIDGE_SELECT : [
					{
						guard : () => nissyGirl.hasInsertedCartridge(),
						target : "cartridge select.cartridge manipulate",
					},
					{
						guard : () => !camera.returnFromCartridgeFlow(),
						target : "cartridge select",
					},
				],
			},
		},

		"cartridge select" : {
			entry : () => cartridges.show(),

			// #region: prompts
			invoke : invokePromptLayer(
				"cartridge",
				[
					[ POWER_ON, {
						display : () => nissyGirl.hasInsertedCartridge() && !nissyGirl.isPowered,
					}],
					[ POWER_OFF, {
						display : () => nissyGirl.hasInsertedCartridge() && nissyGirl.isPowered,
					}],
					[ ROTATE, {
						display : () => nissyGirl.hasInsertedCartridge() && nissyGirl.isPowered,
						prompt : "play",
					}],
					[ CARTRIDGE_INSERT, { display : () => !nissyGirl.hasInsertedCartridge() }],
					[ CARTRIDGE_EJECT, { display : () => nissyGirl.hasInsertedCartridge() && !nissyGirl.isPowered }],
				],
			),

			on : {
				BACK_TO_ZOOM : {
					target : "zooming",
					actions : () => {
						if(!nissyGirl.hasInsertedCartridge()) {
							cartridges.hide();
						}

						camera.setReturningFromCartridgeFlow();
					},
				},
			},

			initial : "carousel",

			states : {
				// Horizontal carousel through cartridges!
				"carousel" : {
					entry : updateVelocityTarget(ROTATE_VELOCITYID, cartridgeX),

					on : {
						CART_DRAG_DELTA : {
							guard : ({ event }) => event.delta > 0,
							actions : raise(() => ({ type : "SELECT_CARTRIDGE" })),
						},

						CART_XDRAG_DELTA : {
							actions : raise(({ event }) => ({ type : "ROTATE_SWIPE", delta : Math.abs(event.delta) })),
						},

						ROTATE_SWIPE : {
							actions : [
								({ event }) => cartridgeX.update(event.delta),
								raise(({ event }) => ({
									type : "CARTRIDGE_IS_OFF_SCREEN",
									dir : Math.sign(event.delta),
								})),
							],
						},

						CARTRIDGE_IS_OFF_SCREEN : {
							guard : () => cartridges.isOffScreen(),

							actions : [
								({ event }) => cartridges.step(event.dir),
								raise({ type : "NEXT_GAME_OR_BACK_TO_ZOOM" }),
							],
						},

						NEXT_GAME_OR_BACK_TO_ZOOM : {
							guard : () => cartridges.isFinishedIterating(),
							actions : raise({ type : "BACK_TO_ZOOM" }),
						},

						SELECT_CARTRIDGE : {
							guard : () => cartridges.cartridgePositionedOverConsole(),
							target : "cartridge manipulate",
						},
					},
				},

				// Vertically move cartridge (selection is maximum progress, deselect is minimum!)
				"cartridge manipulate" : {
					invoke : createReleaseVelocity(VERT_VELOCITYID, "CART_SWIPE"),

					entry : [
						updateVelocityTarget(VERT_VELOCITYID, cartridgeY),
						updateVelocityTarget(ROTATE_VELOCITYID, cartridgeY),
					],

					on : {
						CART_DRAG_START : {
							actions : sendTo(VERT_VELOCITYID, { type : "DRAG_START" }),
						},

						CART_DRAG_END : {
							actions : sendTo(VERT_VELOCITYID, { type : "DRAG_END" }),
						},

						CART_DRAG_DELTA : {
							actions : sendTo(
								VERT_VELOCITYID,
								({ event }) => ({
									type : "DRAG_DELTA",
									delta : event.delta,
								})),
						},

						CART_SWIPE : {
							actions : [
								({ event }) => {
									if(
										event.delta > 0
										&& crossedThreshold(cartridgeY.progress, cartridgeY.project(event.delta), 0.96)
									) {
										audio.playCartridgeScrape();
									}

									cartridgeY.update(event.delta);
								},
								raise({ type : "CARTRIDGE_POSITION" }),
							],
						},

						CARTRIDGE_POSITION : [
							{
								guard : () => cartridges.isCartridgeEjected() && nissyGirl.hasInsertedCartridge(),
								actions : [
									() => nissyGirl.ejectCartridge(),
									sendParent({ type : "CARTRIDGE_EJECTED" }),
								],
							},
							{
								guard : () => cartridges.isFullyInserted(),
								actions : () => nissyGirl.insertCartridge(cartridges.getCurrentCartridgeId()),
							},
						],

						// proxying horizontal swipe to cartridge progress is tough
						// I dislike canonical entry direction as "yes" or opposite as "no"
						ROTATE_SWIPE : {
							actions : [
								raise({ type : "CARTRIDGE_INSERTED_OR_RETURNED" }),
							],
						},

						CARTRIDGE_INSERTED_OR_RETURNED : [
							{
								guard : () => cartridges.isReturnedToCarousel(),
								target : "carousel",
							},
							{
								guard : () => cartridges.isFullyInserted(),
								actions : raise({ type : "BACK_TO_ZOOM" }),
							},
						],
					},
				},
			},
		},
	},
});
