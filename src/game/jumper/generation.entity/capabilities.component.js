import { createEntity } from "$game/shared/entity/entity.js";
import { createJumper } from "../jumper.entity/jumper.entity.js";

import { noopFalseFunction } from "$util/noop.js";

const noopParticles = { spawnDust : noopFalseFunction };
const noopCamera = { follow : noopFalseFunction };

const SIMULATE_PLATFORM_INDEX = 0;
const SIMULATE_SPAWN = { x : 0, y : 1 };

const isOnPlatform = () => true;
const isOffPlatform = () => false;

const isLanding = (startX, startY) => ({
	x : startX,
	y : startY,
	index : SIMULATE_PLATFORM_INDEX,
});
const isAirborne = (startX, startY, targetX, targetY) => ({
	x : targetX,
	y : targetY,
	index : -1,
});

const createSim = () => {
	let groundedResolve = false;
	let intersectionResolve = false;

	return {
		groundedResolve : () => groundedResolve(),
		intersectionResolve : (
			startX,
			startY,
			targetX,
			targetY,
		) => intersectionResolve(startX,
			startY,
			targetX,
			targetY),

		landing : () => {
			intersectionResolve = isLanding;
			groundedResolve = isOnPlatform;
		},
		airborne : () => {
			intersectionResolve = isAirborne;
			groundedResolve = isOffPlatform;
		},
	};
};

const tick = (jumper) => {
	jumper.movement.update(1);
	jumper.physics.update(1);
	jumper.behavior.update(1);
};

const reset = (sim, jumper) => {
	jumper.movement.setPosition(SIMULATE_SPAWN.x, SIMULATE_SPAWN.y);
	jumper.movement.setDir(0, 0);
	jumper.physics.cancelX();
	jumper.physics.cancelY();

	sim.landing();

	tick(jumper);
};

const crouch = (jumper) => {
	jumper.behavior.setCrouchIntent(true);
};

const startHop = (sim, jumper) => {
	jumper.behavior.setJumpIntent(true);
	jumper.movement.setDir(1, 0);

	// first tick gets us in the jumping state
	tick(jumper);
	// have to wait a second tick for intersection code to catch up
	tick(jumper);

	sim.airborne();

	tick(jumper);

	return {
		short : () => {
			jumper.behavior.setJumpIntent(false);
		},
	};
};

const measureHop = ({ holdJump, holdCrouch, maxAttempts = 500 }) => (name, sim, jumper) => {
	const hopStartY = jumper.movement.getY();

	/* eslint-disable-next-line no-useless-assignment -- lol eslint bug? */
	let lastHopY = hopStartY;

	if(holdCrouch) {
		crouch(jumper);
	}

	const hop = startHop(sim, jumper);

	if(!holdJump) {
		hop.short();
	}

	let iterations = 0;

	do{
		lastHopY = jumper.movement.getY();
		tick(jumper);

		iterations++;
	} while(lastHopY > jumper.movement.getY() && iterations < maxAttempts);

	if(iterations >= maxAttempts) {
		throw new Error(`Simulation ${name} exceeded max attempts (${maxAttempts}).`);
	}

	return {
		horz : jumper.movement.getX(),
		vert : hopStartY - lastHopY,
	};
};

const simulationPlan = [
	[ "hopMin", measureHop({ holdJump : false, holdCrouch : false }) ],
	[ "hopMax", measureHop({ holdJump : true, holdCrouch : false }) ],
	[ "blastMin", measureHop({ holdJump : false, holdCrouch : true }) ],
	[ "blastMax", measureHop({ holdJump : true, holdCrouch : true }) ],
];

export const createCapabilities = ({
	world,
}) => {
	world.particles = noopParticles;
	world.camera = noopCamera;

	const sim = createSim();

	// add a simulated platform contract to test against jumper
	world.world.add(createEntity({
		id : "platforms",
		components : {
			bounds : {
				getSpawn : () => SIMULATE_SPAWN,
				remainsGrounded : sim.groundedResolve,
				moveIntersectsPlatform : sim.intersectionResolve,
			},
		},
	}));

	const jumper = createJumper({ world });

	const data = {};

	return {
		async load() {
			for(const [ id, plan ] of simulationPlan) {
				reset(sim, jumper);

				data[id] = plan(id, sim, jumper);
			}
		},

		get() {
			return data;
		},
	};
};
