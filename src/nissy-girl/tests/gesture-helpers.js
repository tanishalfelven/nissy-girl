import { lerp, step, wrap } from "$util/math.js";
import { FPS60, MAX_DT } from "$util/time.js";
import { MS } from "$util/time-string.js";

/** @import { Page } from "@playwright/test" */

/**
 * @typedef {object} Point viewport position in pixels
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef {1 | -1} Direction drag sign, see DIRECTION
 */

/** Velocity dt caps at MAX_DT frames, so a step this long reads as the slowest move. */
const SLOW_STEP_MS = FPS60 * MAX_DT;

/** Long enough for release velocity to carry the device onto its next anchor. */
const SETTLE_MS = MS * 2.5;

const DEG_90 = 90;
const DEG_180 = 180;
const DEG_360 = 360;

/** Where turns start on the camera surface, as viewport fractions. */
const TURN_START = { x : 0.16, y : 0.45 };

/** Where zooms start: higher, leaving room for their downward drag. */
const ZOOM_START = { x : 0.16, y : 0.2 };

const DRAG_FRAMES = 12;
const BACK_TURN_FRAMES = 8;

/** Within this many degrees of the front, the lure rests on the front anchor. */
const ANCHOR_TOLERANCE_DEG = 2;

/** Turn off the front anchor, so a return swipe can cross it and snap. */
const ANCHOR_NUDGE_DEG = 20;

/** Aim past the next face, so a turn into the front crosses its anchor and stops. */
const FACE_OVERSHOOT_DEG = 1;

/** Opening part of a turn that clears the front anchor and the idle lure. */
const TURN_OPENING = 0.08;

/** Closing parts of a turn, each a slow step that bleeds off release velocity. */
const TURN_DECELERATION = [ 0.96, 0.98, 1 ];

/** Turn past the back face that the camera catches as the zoom angle. */
const BACK_ENTRY_MARGIN_DEG = 8;

/** Combined |dx| + |dy| of a single move, in device widths, that saturates zoom. */
const ZOOM_SATURATION = 0.7;

/** Sideways part of a zoom move, in device widths. */
const ZOOM_SIDEWAYS = 0.1;

/** Sideways move, in device widths, that lets go of the cartridge view. */
const CARTRIDGE_VIEW_RELEASE = 0.02;

/** Cartridge drags, in cartridge sizes, far enough past an anchor to commit. */
const CARTRIDGE_PUSH = 1.6;
const CARTRIDGE_SWIPE = 1.3;

/** Where cartridge drags start, as fractions of its height. Only its top shows above the slot. */
const CARTRIDGE_MIDDLE = 0.5;
const CARTRIDGE_TOP = 0.15;

/**
 * @param {Page} page
 * @param {object} options
 * @param {string} options.testId
 * @param {string} options.property custom property set inline, e.g. "--rotation"
 * @returns {Promise<number>}
 */
const readStyleNumber = (page, { testId, property }) => page.getByTestId(testId).evaluate(
	(element, name) => parseFloat(element.style.getPropertyValue(name)),
	property,
);

/**
 * Shortest signed turn between two angles.
 * @param {object} options
 * @param {number} options.from degrees
 * @param {number} options.to degrees
 * @returns {number} degrees in [-180, 180)
 */
const shortestTurn = ({ from, to }) => wrap(to - from, -DEG_180, DEG_180);

/**
 * @param {object} options
 * @param {Point} options.point
 * @param {number} [options.x]
 * @param {number} [options.y]
 * @returns {Point}
 */
const translate = ({ point, x = 0, y = 0 }) => ({ x : point.x + x, y : point.y + y });

/**
 * @param {object} options
 * @param {Point} options.from
 * @param {Point} options.to
 * @param {number} options.progress 0 at `from`, 1 at `to`
 * @returns {Point}
 */
const lerpPoint = ({ from, to, progress }) => ({
	x : lerp(progress, from.x, to.x),
	y : lerp(progress, from.y, to.y),
});

/**
 * @param {Page} page
 * @param {object} options
 * @param {number} options.x fraction of the viewport width
 * @param {number} options.y fraction of the viewport height
 * @returns {Point}
 */
const viewportPoint = (page, { x, y }) => {
	const { width, height } = page.viewportSize();

	return { x : width * x, y : height * y };
};

/**
 * Device width scales every drag: dragging one device width turns it 360 degrees.
 * @param {Page} page
 * @returns {Promise<{ deviceWidth : number, pixelsPerDegree : number }>}
 */
const measureDevice = async (page) => {
	const deviceWidth = await page.getByTestId("device").evaluate((element) => element.clientWidth);

	return { deviceWidth, pixelsPerDegree : deviceWidth / DEG_360 };
};

/**
 * Waits until a pointer at the point would hit the element, e.g. once a turn faces it to the camera.
 * @param {Page} page
 * @param {object} options
 * @param {string} options.testId
 * @param {Point} options.point
 * @returns {Promise<unknown>}
 */
const waitUntilElementIsUnderPoint = (page, { testId, point }) => page.waitForFunction(
	({ testId, point }) => Boolean(document.elementFromPoint(point.x, point.y)?.closest(`[data-testid=${testId}]`)),
	{ testId, point },
);

/**
 * @param {Page} page
 * @param {object} options
 * @param {Point} options.point
 */
const pressPointerAt = async (page, { point }) => {
	await page.mouse.move(point.x, point.y);
	await page.mouse.down();
};

/**
 * Moves the pointer, then runs the clock a frame so the rAF-throttled move registers.
 * @param {Page} page
 * @param {object} options
 * @param {Point} options.point
 * @param {number} [options.ms]
 */
const movePointerTo = async (page, { point, ms = FPS60 }) => {
	await page.mouse.move(point.x, point.y);
	await page.clock.runFor(ms);
};

/**
 * Moves the pointer in a straight line, one step per frame.
 * @param {Page} page
 * @param {object} options
 * @param {Point} options.from
 * @param {Point} options.to
 * @param {number} options.frames
 */
const movePointerOverFrames = async (page, { from, to, frames }) => {
	for(let frame = 1; frame <= frames; frame++) {
		await movePointerTo(page, { point : lerpPoint({ from, to, progress : frame / frames }) });
	}
};

/**
 * Ends a turn in slow steps, so little release velocity remains.
 * @param {Page} page
 * @param {object} options
 * @param {Point} options.from where the turn started
 * @param {Point} options.to
 */
const decelerateTurnTo = async (page, { from, to }) => {
	for(const progress of TURN_DECELERATION) {
		await movePointerTo(page, { point : lerpPoint({ from, to, progress }), ms : SLOW_STEP_MS });
	}
};

/**
 * @param {Page} page
 */
const releasePointerAndSettle = async (page) => {
	await page.mouse.up();
	await page.clock.runFor(SETTLE_MS);
};

/**
 * Drags the active cartridge by multiples of its own size.
 * @param {Page} page
 * @param {object} options
 * @param {{ x? : number, y? : number }} options.by
 * @param {number} [options.startAt] fraction of its height to start from
 */
const dragCartridge = async (page, { by, startAt = CARTRIDGE_MIDDLE }) => {
	const cartridge = page.getByTestId("active-cartridge");

	await cartridge.waitFor({ state : "visible" });

	const box = await cartridge.boundingBox();
	const size = await cartridge.evaluate((element) => ({ width : element.clientWidth, height : element.clientHeight }));
	const start = { x : box.x + box.width / 2, y : box.y + box.height * startAt };
	const end = translate({ point : start, x : size.width * (by.x ?? 0), y : size.height * (by.y ?? 0) });

	await waitUntilElementIsUnderPoint(page, { testId : "active-cartridge", point : start });
	await pressPointerAt(page, { point : start });
	await movePointerOverFrames(page, { from : start, to : end, frames : DRAG_FRAMES });
	await releasePointerAndSettle(page);
};

/** Device rotation that shows each face. */
export const FACE = {
	front : 0,
	left : DEG_90,
	back : DEG_180,
	right : DEG_90 * 3,
};

/** How far the rotation may sit from a face while still showing it. */
export const FACE_MARGIN = 30;

/** Drag signs: a *_LEFT event is a +x drag, a *_RIGHT event a -x drag. */
export const DIRECTION = {
	left : 1,
	right : -1,
};

/**
 * @param {Page} page
 * @returns {Promise<number>} degrees
 */
export const readDeviceRotation = (page) => readStyleNumber(page, { testId : "device", property : "--rotation" });

/**
 * @param {Page} page
 * @param {object} options
 * @param {"x" | "y"} options.axis
 * @returns {Promise<number>} progress, 0 to 1
 */
export const readCartridgePosition = (page, { axis }) => readStyleNumber(page, {
	testId : "active-cartridge",
	property : `--cartridge${axis}`,
});

/**
 * @param {Page} page
 * @param {object} options
 * @param {number} options.face rotation of a face, see FACE
 * @returns {Promise<number>} unsigned degrees
 */
export const readAngleFromFace = async (page, { face }) => {
	const rotation = await readDeviceRotation(page);

	return Math.abs(shortestTurn({ from : rotation, to : face }));
};

/**
 * Swipes the device from wherever the idle lure left it back to its front face.
 * @param {Page} page
 */
export const alignLure = async (page) => {
	const start = viewportPoint(page, TURN_START);
	const { pixelsPerDegree } = await measureDevice(page);

	// Pressing exits the lure and stops its animation and any release velocity.
	await pressPointerAt(page, { point : start });
	await page.clock.runFor(FPS60 * 2);

	let from = start;
	let rotation = await readDeviceRotation(page);

	if(Math.abs(shortestTurn({ from : rotation, to : FACE.front })) < ANCHOR_TOLERANCE_DEG) {
		from = translate({ point : start, x : ANCHOR_NUDGE_DEG * pixelsPerDegree });

		await movePointerTo(page, { point : from, ms : FPS60 * 2 });

		rotation = await readDeviceRotation(page);
	}

	const front = translate({ point : from, x : shortestTurn({ from : rotation, to : FACE.front }) * pixelsPerDegree });

	await movePointerOverFrames(page, { from, to : front, frames : DRAG_FRAMES });
	await releasePointerAndSettle(page);
};

/**
 * Turns the device a quarter turn onto its next face.
 * @param {Page} page
 * @param {object} options
 * @param {Direction} options.direction
 */
export const turnQuarter = async (page, { direction }) => {
	const start = viewportPoint(page, TURN_START);
	const { pixelsPerDegree } = await measureDevice(page);
	const rotation = await readDeviceRotation(page);
	const nextFace = step(rotation + DEG_90 * direction, DEG_90);
	const turn = nextFace + FACE_OVERSHOOT_DEG * direction - rotation;
	const end = translate({ point : start, x : turn * pixelsPerDegree });

	await pressPointerAt(page, { point : start });
	await movePointerTo(page, { point : lerpPoint({ from : start, to : end, progress : TURN_OPENING }) });
	await decelerateTurnTo(page, { from : start, to : end });
	await releasePointerAndSettle(page);
};

/**
 * Turns the device onto its back face, then zooms out to the cartridge view.
 * @param {Page} page
 * @param {object} options
 * @param {Direction} options.direction
 */
export const enterBack = async (page, { direction }) => {
	const start = viewportPoint(page, ZOOM_START);
	const { deviceWidth, pixelsPerDegree } = await measureDevice(page);
	const rotation = await readDeviceRotation(page);
	const turn = (Math.abs(FACE.back - rotation) + BACK_ENTRY_MARGIN_DEG) * direction;
	const atBack = translate({ point : start, x : turn * pixelsPerDegree });

	// Saturate zoom in exactly one move: any further move at full zoom-out is a swipe back.
	const zoomedOut = translate({
		point : atBack,
		x : deviceWidth * ZOOM_SIDEWAYS * direction,
		y : deviceWidth * (ZOOM_SATURATION - ZOOM_SIDEWAYS),
	});

	await pressPointerAt(page, { point : start });
	await movePointerOverFrames(page, { from : start, to : atBack, frames : BACK_TURN_FRAMES });
	await movePointerTo(page, { point : zoomedOut });
	await releasePointerAndSettle(page);
};

/**
 * Leaves the cartridge view: zooms back in, then turns a quarter onto a side face.
 * @param {Page} page
 * @param {object} options
 * @param {Direction} options.direction
 */
export const exitBack = async (page, { direction }) => {
	const start = viewportPoint(page, ZOOM_START);
	const { deviceWidth, pixelsPerDegree } = await measureDevice(page);
	const viewReleased = translate({ point : start, x : deviceWidth * CARTRIDGE_VIEW_RELEASE * direction });
	const zoomedIn = translate({
		point : start,
		x : deviceWidth * ZOOM_SIDEWAYS * direction,
		y : deviceWidth * ZOOM_SATURATION,
	});
	const turned = translate({ point : zoomedIn, x : DEG_90 * direction * pixelsPerDegree });

	await pressPointerAt(page, { point : start });
	await movePointerTo(page, { point : viewReleased });
	await movePointerTo(page, { point : zoomedIn });
	await decelerateTurnTo(page, { from : zoomedIn, to : turned });
	await releasePointerAndSettle(page);
};

/**
 * Pushes the offered cartridge down into the slot.
 * @param {Page} page
 * @returns {Promise<void>}
 */
export const pushCartridgeDown = (page) => dragCartridge(page, { by : { y : CARTRIDGE_PUSH } });

/**
 * Pulls the inserted cartridge up out of the slot by its exposed top.
 * @param {Page} page
 * @returns {Promise<void>}
 */
export const pullCartridgeUp = (page) => dragCartridge(page, { by : { y : -CARTRIDGE_PUSH }, startAt : CARTRIDGE_TOP });

/**
 * Swipes the cartridge carousel sideways.
 * @param {Page} page
 * @param {object} options
 * @param {Direction} options.direction
 * @returns {Promise<void>}
 */
export const swipeCartridge = (page, { direction }) => dragCartridge(page, { by : { x : CARTRIDGE_SWIPE * direction } });

/**
 * @param {Page} page
 */
export const pressPowerSwitch = async (page) => {
	const box = await page.getByTestId("power-switch").boundingBox();
	const center = { x : box.x + box.width / 2, y : box.y + box.height / 2 };

	await waitUntilElementIsUnderPoint(page, { testId : "power-switch-housing", point : center });
	await page.mouse.click(center.x, center.y);
};
