import CoinPng from "./assets/coin.png";
import CoinData from "./assets/coin.json?aseprite-animation";

import { Container, AnimatedSprite } from "pixi.js";

import { getAnimations } from "$game/util/animations.js";

export const COIN_WIDTH = 11;
export const COIN_HEIGHT = 12;
const OUT_ALPHA_STEP = 0.15;

export const createRender = ({
	coins,
}) => {
	let coinAnims;

	const coinLayer = new Container();
	const sprites = [];

	return {
		outroCoin(index) {
			const sprite = sprites[index];

			sprite.textures = coinAnims.explode;
			sprite.loop = false;
			sprite.animationSpeed = 1.25;
			sprite.play();
		},

		async load() {
			coinAnims = await getAnimations(CoinPng, CoinData);

			for(const coin of coins) {
				const coinSprite = new AnimatedSprite({
					textures : coinAnims.idle,
					animationSpeed : 1.05,
					loop : true,
					autoUpdate : false,

					cullable : true,

					position : coin,
				});

				sprites.push(coinSprite);
				coinLayer.addChild(coinSprite);

				coinSprite.play();
			}
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
	};
};
