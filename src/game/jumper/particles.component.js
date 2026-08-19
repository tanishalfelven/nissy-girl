import DustPng from "./assets/dust.png";
import { Assets, ParticleContainer, Particle } from "pixi.js";

const getRandomRotation = () => Math.random() * Math.PI;
let firstRotate = Math.sign(Math.random() - 0.5);
const getRandomDirection = () => {
	firstRotate *= -1;

	return firstRotate;
};

export const createParticles = ({
	world,
}) => {
	const worldRenderable = world.world.getRenderable();

	const particleContainer = new ParticleContainer({
		dynamicProperties : {
			position : true,
			rotation : true,
			alpha : true,

			vertex : false,
			color : false,
		},
	});

	const textures = {
		dust : false,
	};

	const particles = new Set();
	const dead = new Set();

	return {
		async load() {
			textures.dust = await Assets.load({
				src : DustPng,
				data : { scaleMode : "nearest" },
			});

			particleContainer.texture = textures.dust;

			// add self at load, this places us on a higher layer than entities
			worldRenderable.addChild(particleContainer);
		},

		hasUpdate() {
			return particles.size > 0;
		},

		update(dt) {
			for(const particle of particles) {
				if(particle.frames <= 0) {
					dead.add(particle);
					particleContainer.removeParticle(particle.particle);

					continue;
				}

				particle.particle.rotation += particle.speed * dt;
				particle.particle.scaleX += particle.scale * dt;
				particle.particle.scaleY += particle.scale * dt;
				particle.particle.alpha += particle.alpha * dt;
				particle.particle.x += particle.dirX * dt;
				particle.particle.y += particle.dirY * dt;

				particle.frames -= dt;
			}

			if(dead.size > 0) {
				for(const deadParticle of dead) {
					particles.delete(deadParticle);
				}

				dead.clear();
				particleContainer.update();
			}
		},

		spawnDust(x, y, dirX = 0, dirY = 0, scaleX = 1, scaleY = 1) {
			const dust = new Particle({
				x,
				y,
				scaleX,
				scaleY,
				anchorX : 0.5,
				anchorY : 0.5,
				alpha : 0.8,
				texture : textures.dust,
				rotation : getRandomRotation(),
			});

			particles.add({
				frames : 35,
				particle : dust,
				speed : (Math.PI / 20) * getRandomDirection(),
				scale : -0.03,
				alpha : -0.05,
				dirX,
				dirY,
			});

			particleContainer.addParticle(dust);
		},
	};
};
