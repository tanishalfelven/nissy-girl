import { DIRECTION } from "../component/movement.js";

import { wrap } from "$util/math.js";

import { DPAD_DOWN, DPAD_LEFT, DPAD_RIGHT, DPAD_UP } from "../input.consts.js";

const createRow = (x, y) => {
	return ({ x, y, items : [] });
};

/**
 * LOTS of assumptions going on here, we assume LTR and need fixed size
 * no way to jump from a single nav from another (yet) BUT this is a lot
 */

export const createNav = ({
	id,
	keys,
	initial,
}) => {
	const itemByElement = new Map();
	const navElements = [];

	let selectedRowIndex = $state(0);
	let selectedItemIndex = $state(0);
	let selected = $state(initial);

	// all navigation is just rows... right ?
	const rows = [];

	const configureGrid = () => {
		if(navElements.length !== keys.length) {
			return;
		}

		if(rows.length) {
			rows.length = 0;
		}

		for(let i = 0; i < navElements.length; i++) {
			const navElement = navElements[i];
			const key = keys[i];

			const box = navElement.getBoundingClientRect();

			const x = Math.floor(box.x);
			const y = Math.floor(box.y);

			// a point is either in a new row, or its part of an existing one
			let row = rows[rows.length - 1];

			if(!row || row.y < y) {
				row = createRow(x, y);

				rows.push(row);
			}

			const rowItem = {
				key,
				rowIndex : rows.length - 1,
				itemIndex : row.items.length,
				navElement,
			};

			if(key === selected) {
				selectedRowIndex = rowItem.rowIndex;
				selectedItemIndex = rowItem.itemIndex;
			}

			row.items.push(rowItem);
			itemByElement.set(navElement, rowItem);
		}
	};

	return {
		id,

		get active() {
			return selected;
		},

		navPoint : (element) => {
			navElements.push(element);

			configureGrid();

			$effect(() => {
				const elementItem = itemByElement.get(element);

				element.dataset.selected = elementItem.key === selected;

				return () => {

				};
			});
		},

		handleInput : (moving) => {
			for(const dir of moving) {
				if(dir === DPAD_DOWN || dir === DPAD_UP) {
					selectedRowIndex = wrap(selectedRowIndex + DIRECTION.get(dir), 0, rows.length);
				}

				if(dir === DPAD_LEFT || dir === DPAD_RIGHT) {
					selectedItemIndex = wrap(
						selectedItemIndex + DIRECTION.get(dir),
						0,
						rows[selectedRowIndex].items.length,
					);
				}
			}

			selected = rows[selectedRowIndex].items[selectedItemIndex].key;
		},
	};
};
