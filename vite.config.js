import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import mcss from "@modular-css/vite";
import nested from "postcss-nested";

// https://vite.dev/config/
export default defineConfig({
	plugins : [
		mcss({
			before : [
				nested(),
			],
		}),
		svelte(),
	],
	base : "/nissy-girl/",
});
