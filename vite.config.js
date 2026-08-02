import path from "path";

import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import mcss from "@modular-css/vite";
import mcssAlias from "@modular-css/path-aliases";
import nested from "postcss-nested";

const alias = {
	"$games" : path.resolve("src/games"),
	"$nissy-girl" : path.resolve("src/nissy-girl"),
	"$cartridge" : path.resolve("src/cartridge"),
	"$util" : path.resolve("src/util"),
};

const mcssPlugin = mcss({
	before : [
		nested(),
	],
	resolvers : [
		mcssAlias({ aliases : alias }),
	],
});

// i am not well https://github.com/tivac/modular-css/pull/1152
const originalTransform = mcssPlugin.transform;
mcssPlugin.transform = async function (code, id) {
	const result = await originalTransform.call(this, code, id);

	if(result && typeof result.moduleSideEffects === "number") {
		result.moduleSideEffects = Boolean(result.moduleSideEffects);
	}

	return result;
};

export default defineConfig({
	plugins : [
		mcssPlugin,
		svelte(),
	],
	resolve : {
		alias,
	},
	base : "/nissy-girl/",
});
