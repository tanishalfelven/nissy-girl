import { createEntity } from "$game/shared/entity/entity.js";

import { createRender } from "./render.component.js";

import { audio } from "$nissy-girl/sound/audio.js";

export const COIN_WIDTH = 11;
export const COIN_HEIGHT = 12;

const mapCoinToCoin = (coin) => ({
	...coin,
	isAlive : true,
});

export const createCoins = ({
	world,
}) => {
	const { generation, selected } = world.world.getContext();

	const { coins : mapCoins } = generation.maps[selected];

	const coins = mapCoins.map(mapCoinToCoin);

	const render = createRender({ coins, world });

	let jumper;
	let ui;

	return createEntity({
		id : "coins",
		components : {
			coins : {
				getMaxCoins : () => coins.length,

				async load() {
					jumper = world.world.get("jumper");
					ui = world.world.get("ui").ui;
				},

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
								audio.jumper.playCoin();

								coin.isAlive = false;
								render.outroCoin(i);
								ui.collectCoin();
							}
						}
					}
				},
			},

			render,
		},
	});
};
