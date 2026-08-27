import { createEntity } from "$game/shared/entity/entity.js";

import { Graphics } from "pixi.js";

const ARMS = 23;
const POINTS_PER_ARM = 60;
const MAX_RADIUS = 80;

export const createSwirl = ({
	world,
}) => {
	const worldBounds = world.world.getBounds();

	const swirl = new Graphics();

	swirl.position.set(worldBounds.width / 2, worldBounds.height / 2);

	return createEntity({
		id : "swirl",
		components : {
			render : {
				hasUpdate() {
					return true;
				},

				update(dt) {
					swirl.rotation += 0.002 * dt;

					swirl.clear();

					for(let arm = 0; arm < ARMS; arm++) {
						const armOffset = (Math.PI * 2 * arm) / ARMS;

						for(let i = 0; i < POINTS_PER_ARM; i++) {
							const t = i / (POINTS_PER_ARM - 1);

							const radius = t * MAX_RADIUS;
							const angle = armOffset + t * Math.PI;

							const x = Math.cos(angle) * radius;
							const y = Math.sin(angle) * radius;

							swirl
								.rect(
									x,
									y,
									4 * t,
									4 * t,
								)
								.fill({
									color : arm % 2 === 0 ? 0x839cf6 : 0x9baff8,
									alpha : i / POINTS_PER_ARM,
								});
						}
					}
				},

				getRenderable() {
					return swirl;
				},
			},
		},
	});
};
