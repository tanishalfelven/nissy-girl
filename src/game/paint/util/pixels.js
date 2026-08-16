import {
	BufferImageSource,
	Texture,
	Sprite,
} from "pixi.js";

import { COLOR_WHITE, COLORS } from "./colors.js";

export class PixelCanvas {
	constructor({
		width = 120,
		height = 96,
		background = COLOR_WHITE,
		historyLimit = 30,
	} = false) {
		this.width = width;
		this.height = height;
		this.historyLimit = historyLimit;

		this.pixels = new Uint8Array(width * height * 4);

		this.undoStack = [];
		this.redoStack = [];

		this.selectedColor = "black";

		this.source = new BufferImageSource({
			resource : this.pixels,
			width,
			height,
			format : "rgba8unorm",
			scaleMode : "nearest",
		});

		this.texture = new Texture({
			source : this.source,
		});

		this.sprite = new Sprite(this.texture);

		this.clear(background, {
			commit : false,
			update : false,
		});

		this.update();
	}

	getColor() {
		return this.selectedColor;
	}

	setColor(colorId) {
		if(!COLORS.has(colorId)) {
			throw new Error(`Color "${colorId}" does not exist.`);
		}

		this.selectedColor = colorId;
	}

	index(x, y) {
		return (y * this.width + x) * 4;
	}

	inBounds(x, y) {
		return (
			x >= 0
			&& y >= 0
			&& x < this.width
			&& y < this.height
		);
	}

	getPixel(x, y) {
		if(!this.inBounds(x, y)) {
			return null;
		}

		const i = this.index(x, y);

		return [
			this.pixels[i],
			this.pixels[i + 1],
			this.pixels[i + 2],
			this.pixels[i + 3],
		];
	}

	setPixel(x, y, color) {
		if(!this.inBounds(x, y)) {
			return;
		}

		const i = this.index(x, y);

		this.pixels[i] = color[0];
		this.pixels[i + 1] = color[1];
		this.pixels[i + 2] = color[2];
		this.pixels[i + 3] = color[3] ?? 255;
	}

	colorsEqual(a, b) {
		return (
			a[0] === b[0]
			&& a[1] === b[1]
			&& a[2] === b[2]
			&& a[3] === b[3]
		);
	}

	snapshot() {
		return this.pixels.slice();
	}

	restore(snapshot) {
		this.pixels.set(snapshot);
	}

	commit() {
		this.undoStack.push(this.snapshot());

		if(this.undoStack.length > this.historyLimit) {
			this.undoStack.shift();
		}

		this.redoStack.length = 0;
	}

	undo() {
		const previous = this.undoStack.pop();

		if(!previous) {
			return false;
		}

		this.redoStack.push(this.snapshot());

		this.pixels.set(previous);
		this.update();

		return true;
	}

	redo() {
		const next = this.redoStack.pop();

		if(!next) {
			return false;
		}

		this.undoStack.push(this.snapshot());

		this.pixels.set(next);
		this.update();

		return true;
	}

	drawLine(x0, y0, x1, y1) {
		const color = COLORS.get(this.selectedColor);

		x0 = Math.round(x0);
		y0 = Math.round(y0);
		x1 = Math.round(x1);
		y1 = Math.round(y1);

		const dx = Math.abs(x1 - x0);
		const sx = x0 < x1 ? 1 : -1;

		const dy = -Math.abs(y1 - y0);
		const sy = y0 < y1 ? 1 : -1;

		let error = dx + dy;

		while(true) {
			this.setPixel(x0, y0, color);

			if(x0 === x1 && y0 === y1) {
				break;
			}

			const e2 = 2 * error;

			if(e2 >= dy) {
				error += dy;
				x0 += sx;
			}

			if(e2 <= dx) {
				error += dx;
				y0 += sy;
			}
		}
	}

	floodFill(x, y, color = COLORS.get(this.selectedColor)) {
		x = Math.round(x);
		y = Math.round(y);

		if(!this.inBounds(x, y)) {
			return;
		}

		const targetColor = this.getPixel(x, y);

		if(this.colorsEqual(targetColor, color)) {
			return;
		}

		const stack = [[ x, y ]];

		while(stack.length) {
			const [ cx, cy ] = stack.pop();

			if(!this.inBounds(cx, cy)) {
				continue;
			}

			const currentColor = this.getPixel(cx, cy);

			if(!this.colorsEqual(currentColor, targetColor)) {
				continue;
			}

			this.setPixel(cx, cy, color);

			stack.push(
				[ cx + 1, cy ],
				[ cx - 1, cy ],
				[ cx, cy + 1 ],
				[ cx, cy - 1 ],
			);
		}
	}

	clear(
		color = COLOR_WHITE,
		{
			commit = true,
		} = false,
	) {
		if(commit) {
			this.commit();
		}

		for(let i = 0; i < this.pixels.length; i += 4) {
			this.pixels[i] = color[0];
			this.pixels[i + 1] = color[1];
			this.pixels[i + 2] = color[2];
			this.pixels[i + 3] = color[3] ?? 255;
		}
	}

	update() {
		this.source.update();
	}

	destroy() {
		this.sprite.destroy();
		this.texture.destroy();
		this.source.destroy();

		this.undoStack.length = 0;
		this.redoStack.length = 0;
	}
}
