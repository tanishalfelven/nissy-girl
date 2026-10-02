import { SIDE_LEFT, SIDE_RIGHT } from "./manual.consts.js";
import { manualContentPages } from "./manual.data.js";

let currentPageIndex = $state(0);
let dragX = $state(0);
let dragY = $state(0);

const hasNextPage = () => currentPageIndex < manualContentPages.length - 1;
const hasPrevPage = () => currentPageIndex > 0;

export const manual = {
	get currentPageIndex() {
		return currentPageIndex;
	},

	get curlPageIndex() {
		if(hasNextPage() && dragX < 0) {
			return currentPageIndex + 1;
		}

		if(hasPrevPage() && dragX > 0) {
			return currentPageIndex - 1;
		}

		return false;
	},

	get dragX() {
		return dragX;
	},

	get dragY() {
		return dragY;
	},

	getCurrentPageFacing() {
		return manualContentPages[currentPageIndex].side;
	},

	getIsSpread() {
		const side = manualContentPages[currentPageIndex].side;

		if(side === SIDE_LEFT) {
			return hasNextPage()
				&& manualContentPages[currentPageIndex + 1].side === SIDE_RIGHT;
		}

		if(side === SIDE_RIGHT) {
			return hasPrevPage()
				&& manualContentPages[currentPageIndex - 1].side === SIDE_LEFT;
		}
	},

	hasPrevPage : hasPrevPage,
	hasNextpage : hasNextPage,

	multiplyDrag(deltaMultiply) {
		dragX *= deltaMultiply;
		dragY *= deltaMultiply;
	},

	accumulateDrag(deltaX, deltaY) {
		dragX += deltaX;
		dragY += deltaY;
	},

	clearDrag() {
		dragX = 0;
		dragY = 0;
	},

	nextPage() {
		if(hasNextPage()) {
			currentPageIndex++;
		}
	},

	prevPage() {
		if(hasPrevPage()) {
			currentPageIndex--;
		}
	},
};
