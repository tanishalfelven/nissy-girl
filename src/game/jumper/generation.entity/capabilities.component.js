import { createEntity } from "$game/shared/entity/entity.js";
import { createJumper } from "../jumper.entity/jumper.entity.js";

export const createCapabilities = ({
	world,
}) => {
	world.particles = { spawnDust : () => false };

	// add a simulated platform contract to test against jumper
	world.world.add(createEntity({
		id : "platforms",
		components : {
			bounds : {
				remainsGrounded : () => false,
				moveIntersectsPlatform : (
					startX,
					startY,
					targetX,
					targetY,
					// width
				) => {
					return {
						x : targetX,
						y : targetY,
						index : -1,
					};
				},
			},
		},
	}));

	const jumper = createJumper({ world });

	return {
		async load() {
			jumper.physics.addY(-1000);

			// silly for this pass
			for(let i = 0; i < 20; i++) {
				jumper.behavior.update();
			}

			world.world.notifyGame({ type : "DONE" });
		},
	};
};
