import { Color } from "pixi.js";

export const COLOR_BLACK = 0x000000;
export const COLOR_OFF_BLACK = 0x0a0a0a;
export const COLOR_WHITE = 0xffffff;
export const COLOR_RED = 0xac0022;
export const COLOR_MUTE_LIME = 0x6abe30;
export const COLOR_SILVER = 0x9badb7;
export const COLOR_GOLD = 0xefd71f;

// A subset of Aseprites default palette from Richard "DawnBringer" Fhager 32 colors palette
// https://www.aseprite.org/docs/default-palette/
// I decided this set cus I like them, and gave them silly names

// these exist as RGBA_ARRAY for paints convenience, since it owns its own renderer
export const RGBA_ARRAY_PORCELAIN_RED = [ 217, 87, 99, 255 ];
export const RGBA_ARRAY_SOUP_RED = [ 172, 50, 50, 255 ];
export const RGBA_ARRAY_FOREST_GREEN = [ 75, 105, 47, 255 ];
export const RGBA_ARRAY_BROWN_GREEN = [ 82, 75, 36, 255 ];
export const RGBA_ARRAY_LIGHT_SEA_GREEN = [ 55, 148, 110, 255 ];
export const RGBA_ARRAY_DEEP_SEA_GREEN = [ 34, 93, 69, 255 ];
export const RGBA_ARRAY_ICY_BLUE = [ 99, 155, 255, 255 ];
export const RGBA_ARRAY_DIRT_BLUE = [ 48, 96, 130, 255 ];
export const RGBA_ARRAY_SKY_BLUE = [ 95, 205, 228, 255 ];
export const RGBA_ARRAY_MYSTERY_BROWN_PURPLE = [ 63, 63, 116, 255 ];
export const RGBA_ARRAY_PINK = [ 215, 123, 186, 255 ];
export const RGBA_ARRAY_BURNT_BARBIE = [ 69, 40, 60, 255 ];
export const RGBA_ARRAY_HEX_PURPLE = [ 118, 66, 138, 255 ];
export const RGBA_ARRAY_DANK = [ 34, 32, 52, 255 ];
export const RGBA_ARRAY_YELLOW = [ 251, 242, 54, 255 ];
export const RGBA_ARRAY_ORANGE = [ 223, 113, 38, 255 ];
export const RGBA_ARRAY_BROWN = [ 143, 86, 59, 255 ];
export const RGBA_ARRAY_FOREST_BROWN = [ 102, 57, 49, 255 ];
export const RGBA_ARRAY_LIGHT_TAN = [ 238, 195, 154, 255 ];
export const RGBA_ARRAY_TANNER_TAN = [ 217, 160, 102, 255 ];
export const RGBA_ARRAY_COLOR_WHITE = [ 255, 255, 255, 255 ];
export const RGBA_ARRAY_COLOR_BLACK = [ 0, 0, 0, 255 ];

const arrayAsPixiColor = ([ r, g, b, a ]) => new Color({ r, g, b, a });

export const COLOR_PORCELAIN_RED = arrayAsPixiColor(RGBA_ARRAY_PORCELAIN_RED);
export const COLOR_SOUP_RED = arrayAsPixiColor(RGBA_ARRAY_SOUP_RED);
export const COLOR_FOREST_GREEN = arrayAsPixiColor(RGBA_ARRAY_FOREST_GREEN);
export const COLOR_BROWN_GREEN = arrayAsPixiColor(RGBA_ARRAY_BROWN_GREEN);
export const COLOR_LIGHT_SEA_GREEN = arrayAsPixiColor(RGBA_ARRAY_LIGHT_SEA_GREEN);
export const COLOR_DEEP_SEA_GREEN = arrayAsPixiColor(RGBA_ARRAY_DEEP_SEA_GREEN);
export const COLOR_ICY_BLUE = arrayAsPixiColor(RGBA_ARRAY_ICY_BLUE);
export const COLOR_DIRT_BLUE = arrayAsPixiColor(RGBA_ARRAY_DIRT_BLUE);
export const COLOR_SKY_BLUE = arrayAsPixiColor(RGBA_ARRAY_SKY_BLUE);
export const COLOR_MYSTERY_BROWN_PURPLE = arrayAsPixiColor(RGBA_ARRAY_MYSTERY_BROWN_PURPLE);
export const COLOR_PINK = arrayAsPixiColor(RGBA_ARRAY_PINK);
export const COLOR_BURNT_BARBIE = arrayAsPixiColor(RGBA_ARRAY_BURNT_BARBIE);
export const COLOR_HEX_PURPLE = arrayAsPixiColor(RGBA_ARRAY_HEX_PURPLE);
export const COLOR_DANK = arrayAsPixiColor(RGBA_ARRAY_DANK);
export const COLOR_YELLOW = arrayAsPixiColor(RGBA_ARRAY_YELLOW);
export const COLOR_ORANGE = arrayAsPixiColor(RGBA_ARRAY_ORANGE);
export const COLOR_BROWN = arrayAsPixiColor(RGBA_ARRAY_BROWN);
export const COLOR_FOREST_BROWN = arrayAsPixiColor(RGBA_ARRAY_FOREST_BROWN);
export const COLOR_LIGHT_TAN = arrayAsPixiColor(RGBA_ARRAY_LIGHT_TAN);
export const COLOR_TANNER_TAN = arrayAsPixiColor(RGBA_ARRAY_TANNER_TAN);
