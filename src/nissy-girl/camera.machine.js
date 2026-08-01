import {
	createMachine,
	sendTo,
	raise,
} from "xstate";
import { crossedThresholdWrapInclusive } from "./util/math.js";

import {
	createReleaseVelocity,
	ROTATE_VELOCITYID,
	VERT_VELOCITYID,
} from "./util/release-velocity.actor.js";

import { MIN_PROGRESS, MAX_PROGRESS } from "./util/progress.svelte.js";

import {
	camera,
	rotation,
	zoom,
	ZOOM_ROTATION_THRESHOLD,
} from "./camera.viewmodel.svelte.js";

import {
	cartridges,
	cartridgeX,
	cartridgeY,
	CARTRIDGE_SELECTION_THRESHOLD,
} from "./cartridge/cartridge.viewmodel.svelte.js";

import { nissyGirl } from "./nissy-girl.viewmodel.svelte.js";

const updateVelocityTarget = (target, progress) =>
	sendTo(target, { type : "NEW_TARGET", progress });

export const cameraMachine = createMachine({
	id : "camera",

	initial : "playing",

	invoke : [
		createReleaseVelocity(ROTATE_VELOCITYID, "ROTATE_SWIPE"),
	],

	on : {
		DRAG_START : {
			actions : sendTo(ROTATE_VELOCITYID, { type : "DRAG_START" }),
		},

		DRAG_END : {
			actions : sendTo(ROTATE_VELOCITYID, { type : "DRAG_END" }),
		},

		DRAG_DELTA : {
			actions : sendTo(ROTATE_VELOCITYID, ({ event }) => ({ type : "DRAG_DELTA", delta : event.delta })),
		},
	},

	states : {
		"playing" : {
			entry : [
				updateVelocityTarget(ROTATE_VELOCITYID, rotation),
			],

			on : {
				ROTATE_SWIPE : [
					{
						// This is a bit odd but we don't bother creating an anchor for our
						// rotation threshold BECAUSE we want to preserve momentum
						guard : ({ event }) => {
							// Replicating anchor logic here - this lets us continue rotation
							// upon return
							if(rotation.progress === ZOOM_ROTATION_THRESHOLD
								&& camera.returnFromCartridgeFlow
							) {
								return false;
							}

							return crossedThresholdWrapInclusive(
								rotation.progress,
								rotation.project(event.delta),
								ZOOM_ROTATION_THRESHOLD,
							);
						},
						actions : () => rotation.set(ZOOM_ROTATION_THRESHOLD),
						target : "zooming",
					},
					{
						actions : ({ event }) => {
							rotation.update(event.delta);

							// prepares us to re-enter cartridge scroll
							camera.clearReturningFromCartridgeFlow();

							if(!nissyGirl.hasInsertedCartridge) {
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
						guard : () => zoom.progress === MAX_PROGRESS,
						actions : raise({ type : "SCROLL_AT_MAX_CARTRIDGE_SELECT" }),
					},
					{
						guard : () => zoom.progress === MIN_PROGRESS,
						target : "playing",
					},
				],

				SCROLL_AT_MAX_CARTRIDGE_SELECT : [
					{
						guard : () => nissyGirl.hasInsertedCartridge,
						target : "cartridge select.cartridge manipulate",
					},
					{
						guard : () => !camera.returnFromCartridgeFlow,
						target : "cartridge select",
					},
				],
			},
		},

		"cartridge select" : {
			entry : () => cartridges.show(),

			on : {
				BACK_TO_ZOOM : {
					target : "zooming",
					actions : () => {
						if(!nissyGirl.hasInsertedCartridge) {
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

						ROTATE_SWIPE : {
							actions : [
								({ event }) => !cartridgeX.update(event.delta),
								raise(({ event }) => ({
									type : "TEST_CARTRIDGE_X_BOUNDS",
									dir : Math.sign(event.delta),
								})),
							],
						},

						TEST_CARTRIDGE_X_BOUNDS : {
							guard : () =>
								(cartridgeX.progress === MAX_PROGRESS
									|| cartridgeX.progress === MIN_PROGRESS),

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
							guard : () =>
								cartridgeX.progress === CARTRIDGE_SELECTION_THRESHOLD,
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
								}
								)),
						},

						CART_SWIPE : {
							actions : [
								({ event }) => cartridgeY.update(event.delta),
							],
						},

						// proxying horizontal swipe to cartridge progress is tough
						// I dislike canonical entry direction as "yes" or opposite as "no"
						ROTATE_SWIPE : {
							actions : [
								raise({ type : "TEST_CARTRIDGE_Y_BOUNDS" }),
							],
						},

						TEST_CARTRIDGE_Y_BOUNDS : [
							{
								guard : () => cartridgeY.progress === MIN_PROGRESS,
								actions : () => nissyGirl.ejectCartridge(),
								target : "carousel",
							},
							{
								guard : () => cartridgeY.progress === MAX_PROGRESS,
								actions : [
									() => nissyGirl.insertCartridge(cartridges.getCurrentCartridgeId()),
									raise({ type : "BACK_TO_ZOOM" }),
								],
							},
						],
					},
				},
			},
		},
	},
});
