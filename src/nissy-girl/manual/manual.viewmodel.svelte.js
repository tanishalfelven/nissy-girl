import { SIDE_LEFT, SIDE_RIGHT } from "./manual.consts.js";
import { manualContentPages } from "./manual.data.js";

let currentPageIndex = $state(0);
let curlX = $state(0);
let curlY = $state(0);

const hasNextPage = () => currentPageIndex < manualContentPages - 1;
const hasPrevPage = () => currentPageIndex > 0;

export const manual = {
	get currentPageIndex() {
		return currentPageIndex;
	},

	get curlX() {
		return curlX;
	},

	get curlY() {
		return curlY;
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

	projectCurlX(deltaX) {
		return curlX + deltaX;
	},

	projectCurlY(deltaY) {
		return curlY + deltaY;
	},

	accumulateCurl(deltaX, deltaY) {
		curlX += deltaX;
		curlY += deltaY;
	},

	clearCurl() {
		curlX = 0;
		curlY = 0;
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
