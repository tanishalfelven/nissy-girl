import LeftArmPng from "./assets/leftarm.png";
import LeftLegPng from "./assets/leftleg.png";
import RightArmPng from "./assets/rightarm.png";
import RightLegPng from "./assets/rightleg.png";
import HeadPng from "./assets/head.png";
import HairPng from "./assets/hair.png";
import TorsoPng from "./assets/torso.png";

import { createInput } from "$game/shared/component/input.component.js";

import { createEntity } from "$game/shared/entity/entity.js";

import { Container, Graphics, Sprite, Assets } from "pixi.js";
import { COLOR_BLACK, COLOR_BROWN, COLOR_WHITE } from "$nissy-girl/screens/render.consts.js";

import { createTemporalWindow } from "$game/util/temporal.js";
import { DPAD_DOWN } from "$game/shared/input.consts.js";

const cycle = (frames) => {
	let i = 0;

	return {
		reset() {
			i = 0;
		},

		next() {
			return frames[(i + 1) % frames.length];
		},

		current() {
			return frames[i];
		},

		update() {
			i++;

			if(i >= frames.length) {
				i = 0;
			}

			return frames[i];
		},
	};
};

export const createSkelton = ({
	world,
}) => {
	const leftArmOrigin = { x : 1, y : 9 };
	const leftArm = new Sprite({
		position : leftArmOrigin,
		pivot : { x : 1, y : 0 },
	});
	const rightArmOrigin = { x : 10, y : 9 };
	const rightArm = new Sprite({
		position : rightArmOrigin,
		pivot : { x : 1, y : 0 },
	});
	const leftLegOrigin = { x : 2, y : 15 };
	const leftLeg = new Sprite({
		position : leftLegOrigin,
		pivot : { x : 1, y : 1 },
	});
	const rightLegOrigin = { x : 10, y : 15 };
	const rightLeg = new Sprite({
		position : rightLegOrigin,
		pivot : { x : 3, y : 1 },
	});
	const torsoOrigin = { x : 6, y : 13 };
	const torso = new Sprite({
		position : torsoOrigin,
		pivot : { x : 4, y : 3 },
	});
	const hairOrigin = { x : 2, y : 5 };
	const hair = new Sprite({
		position : hairOrigin,
		pivot : { x : 2, y : 3 },
	});

	const eyes = new Graphics();
	const pupils = new Graphics();

	eyes.rect(3, 7, 2, 1).fill(COLOR_WHITE);
	eyes.rect(3, 6, 2, 1).fill(COLOR_BROWN);
	eyes.rect(7, 7, 2, 1).fill(COLOR_WHITE);
	eyes.rect(7, 6, 2, 1).fill(COLOR_BROWN);
	pupils.rect(4, 7, 1, 1).fill(COLOR_BLACK);
	pupils.rect(7, 7, 1, 1).fill(COLOR_BLACK);

	const headOrigin = { x : 5, y : 4 };
	const head = new Sprite({
		position : headOrigin,
		pivot : { x : 5, y : 3 },
		children : [
			eyes,
			pupils,
		],
	});

	const character = new Container({
		x : 50,
		y : 50,
		children : [
			leftArm,
			rightArm,
			leftLeg,
			rightLeg,
			torso,
			head,
			hair,
		],
	});

	const run = createTemporalWindow(60);

	const headBobCycle = cycle([ 0, 1, 0, 0 ]);
	const hairBobCycle = cycle([ 0, 0.25, 0.5, 0.25 ]);

	const leftArmRotation = cycle([ 0, 0.25, 0.5, 0.75, 0.5, 0.25 ]);
	const rightArmRotation = cycle([ 0.75, 0.5, 0.25, 0, 0.25, 0.5 ]);

	const leftLegRotation = cycle([ 1, 0.9, 0.75, 0.6, 0.75, 0.9 ]);
	const rightLegRotation = cycle([ 0.75, 0.6, 0.75, 0.9, 1, 0.9 ]);

	const resetRun = () => {
		headBobCycle.reset();
		hairBobCycle.reset();
		leftArmRotation.reset();
		rightArmRotation.reset();
		leftLegRotation.reset();
		rightLegRotation.reset();

		run.stop();

		head.position.y = headOrigin.y;

		hair.position.y = hairOrigin.y;
		hair.rotation = 0;

		leftArm.rotation = 0;
		rightArm.rotation = 0;

		torso.rotation = 0;

		leftLeg.scale.y = 1;
		leftLeg.rotation = 0;
		rightLeg.scale.y = 1;
		rightLeg.rotation = 0;
	};

	const toHairRot = (hairY) => -hairY * 0.4;
	const toTorsoRot = (leftArmRot) => leftArmRot - 0.37;
	const toLeftLegRot = (leftLegRot) => -1 + leftLegRot;
	const toRightLegRot = (rightLegRot) => 1 - rightLegRot;

	const runUpdate = () => {
		run.start();

		const headY = headBobCycle.update();
		head.position.y = headOrigin.y + headY;

		const hairY = hairBobCycle.update();
		hair.position.y = hairOrigin.y + hairY;
		hair.rotation = toHairRot(hairY);

		leftArm.rotation = leftArmRotation.update() * 0.8;
		rightArm.rotation = -rightArmRotation.update() * 0.8;

		torso.rotation = toTorsoRot(leftArmRotation.current());

		leftLeg.scale.y = leftLegRotation.update();
		leftLeg.rotation = toLeftLegRot(leftLegRotation.current());
		rightLeg.scale.y = rightLegRotation.update();
		rightLeg.rotation = toRightLegRot(rightLegRotation.current());
	};

	let downIntent = false;

	const input = createInput({
		onInputChange(inputs) {
			downIntent = inputs.has(DPAD_DOWN);

			if(downIntent && !run.active()) {
				run.start();
			}
		},
	});

	return createEntity({
		id : "character",
		components : {
			input,
			render : {
				async load() {
					const textures = await Assets.load([
						{
							src : LeftArmPng,
							alias : "leftarm",
						},
						{
							src : LeftLegPng,
							alias : "leftleg",
						},
						{
							src : RightArmPng,
							alias : "rightarm",
						},
						{
							src : RightLegPng,
							alias : "rightleg",
						},
						{
							src : TorsoPng,
							alias : "torso",
						},
						{
							src : HeadPng,
							alias : "head",
						},
						{
							src : HairPng,
							alias : "hair",
						},
					]);

					leftArm.texture = textures.leftarm;
					rightArm.texture = textures.rightarm;

					leftLeg.texture = textures.leftleg;
					rightLeg.texture = textures.rightleg;

					torso.texture = textures.torso;
					head.texture = textures.head;
					hair.texture = textures.hair;
				},

				hasUpdate() {
					return true;
				},

				update(dt) {
					if(downIntent && run.update(dt)) {
						runUpdate();
					} else if(!downIntent && run.active()) {
						resetRun();
					}
				},

				getRenderable() {
					return character;
				},
			},
		},
	});
};
