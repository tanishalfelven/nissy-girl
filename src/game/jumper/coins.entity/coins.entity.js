import { createEntity } from "$game/shared/entity/entity.js";

import { AnimatedSprite, Container } from "pixi.js";

import CoinPng from "./assets/coin.png";
import CoinData from "./assets/coin.json?aseprite-animation";

import { getAnimations } from "$game/util/animations.js";

const COIN_WIDTH = 11;
const COIN_HEIGHT = 12;
const OUT_ALPHA_STEP = 0.25;

const coin = (x, y) => ({ x, y, isAlive : true });

export const createCoins = ({
	world,
}) => {
	let coinAnims;

	const coinLayer = new Container();

	const coins = [
		coin(40, 70),
	];

	const sprites = [];

	let jumper;

	return createEntity({
		id : "coins",
		components : {
			coins : {
				// TODO share logic for on screen check with render
				hasUpdate : () => jumper.behavior.isMoving(),

				update() {
					for(let i = 0; i < coins.length; i++) {
						const coin = coins[i];

						if(!coin.isAlive) {
							continue;
						}

						if(coin.isAlive) {
							const hit = jumper.behavior.intersectsBounds(coin.x, coin.y, COIN_WIDTH, COIN_HEIGHT);

							if(hit) {
								jumper.render.reactToCollect();

								const sprite = sprites[i];

								coin.isAlive = false;

								sprite.textures = coinAnims.explode;
								sprite.loop = false;
								sprite.animationSpeed = 1.15;
								sprite.play();
							}
						}
					}
				},
			},
			render : {
				async load() {
					coinAnims = await getAnimations(CoinPng, CoinData);

					for(const coin of coins) {
						const coinSprite = new AnimatedSprite({
							textures : coinAnims.idle,
							animationSpeed : 1,
							loop : true,
							autoUpdate : false,

							position : coin,
						});

						sprites.push(coinSprite);
						coinLayer.addChild(coinSprite);

						coinSprite.play();
					}

					jumper = world.world.get("jumper");
				},

				getRenderable() {
					return coinLayer;
				},

				// TODO we should only track and update if living coins are in camera bounds
				hasUpdate() {
					return true;
				},

				update(dt) {
					for(let i = 0; i < coins.length; i++) {
						const coin = coins[i];
						const sprite = sprites[i];

						if(sprite.playing) {
							sprite.update({ deltaTime : dt });
						} else if(!coin.isAlive && !sprite.destroyed) {
							if(sprite.alpha > 0) {
								sprite.alpha -= OUT_ALPHA_STEP * dt;
							} else {
								sprite.destroy();
							}
						}
					}
				},

				destroy() {
					if(coinAnims) {
						coinAnims.destroy();
					}

					coinLayer.destroy();

					for(const sprite of sprites) {
						sprite.destroy();
					}
				},
			},
		},
	});
};
