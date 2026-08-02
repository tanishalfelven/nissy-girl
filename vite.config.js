import path from "path";

import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import mcss from "@modular-css/vite";
import mcssAlias from "@modular-css/path-aliases";
import nested from "postcss-nested";

const alias = {
	"$games" : path.resolve("src/games"),
	"$nissy-girl" : path.resolve("src/nissy-girl"),
	"$util" : path.resolve("src/util"),
};

export default defineConfig({
	plugins : [
		mcss({
			before : [
				nested(),
			],
			resolvers : [
				mcssAlias({ aliases : alias }),
			],
		}),
		svelte(),
	],
	resolve : {
		alias,
	},
	base : "/nissy-girl/",
});
