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

import {
	camera,
	rotation,
	zoom,
} from "./camera.viewmodel.svelte.js";
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
							actions : raise(({ event }) => ({ type : "ROTATE_SWIPE", delta : event.delta })),
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
								({ event }) => cartridgeY.update(event.delta),
								raise({ type : "HAS_CARTRIDGE_EJECTED" }),
							],
						},

						HAS_CARTRIDGE_EJECTED : {
							guard : () => cartridges.isCartridgeEjected(),
							actions : [
								() => nissyGirl.ejectCartridge(),
								sendParent({ type : "CARTRIDGE_EJECTED" }),
							],
						},

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
