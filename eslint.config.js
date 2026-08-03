import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";
import svelte from "eslint-plugin-svelte";
import svelteParser from "svelte-eslint-parser";
import stylistic from "@stylistic/eslint-plugin";
import { jsdoc } from "eslint-plugin-jsdoc";
import unusedImports from "eslint-plugin-unused-imports";
import { importX } from "eslint-plugin-import-x";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";

const plugins = {
	js,
	"@stylistic" : stylistic,
	"unused-imports" : unusedImports,
	svelte,
};

export default defineConfig([
	stylistic.configs.recommended,
	importX.flatConfigs.recommended,
	jsdoc({ config : "flat/recommended" }),
	{
		files : [ "**/*.{js,mjs,cjs}" ],
		plugins,
		extends : [ "js/recommended" ],
		languageOptions : {
			globals : globals.browser,
		},
	},
	{
		files : [ "**/*.svelte", "**/*.svelte.js" ],
		plugins,
		languageOptions : {
			globals : globals.browser,
			parser : svelteParser,
		},
	},
	{
		rules : {
			"@stylistic/linebreak-style" : [ "error", "unix" ],
			"svelte/prefer-svelte-reactivity" : "off",
			"svelte/indent" : [
				"error",
				{
					indent : "tab",
					indentScript : false,
				},
			],
			"@stylistic/arrow-parens" : [ "error", "always" ],
			"no-console" : "warn",
			"@stylistic/no-tabs" : "off",
			"@stylistic/indent" : [ "error", "tab" ],
			"@stylistic/indent-binary-ops" : [ "error", "tab" ],
			"@stylistic/operator-linebreak" : [ "error", "before", { overrides : { "=" : "after" } }],
			"@stylistic/quotes" : [ "error", "double" ],
			"@stylistic/semi" : [ "error", "always" ],
			"@stylistic/key-spacing" : [ "error", { beforeColon : true, afterColon : true }],
			"@stylistic/brace-style" : [ "error", "1tbs" ],
			"@stylistic/array-bracket-spacing" : [
				"error", "always",
				{ arraysInArrays : false, objectsInArrays : false },
			],
			"@stylistic/eol-last" : [ "error", "always" ],
			"@stylistic/keyword-spacing" : [
				"error",
				{
					before : true,
					after : false,
					overrides : {
						return : { after : true },
						import : { after : true },
						from : { after : true },
						export : { after : true },
						const : { after : true },
						let : { after : true },
						else : { after : true },
					},
				},
			],
			"no-unused-vars" : "off",
			"unused-imports/no-unused-imports" : "error",
			"unused-imports/no-unused-vars" : [
				"warn",
				{
					vars : "all",
					varsIgnorePattern : "^_",
					args : "after-used",
					argsIgnorePattern : "^_",
				},
			],
			"import-x/extensions" : [ "error", "ignorePackages", { fix : true }],
			"jsdoc/require-param-description" : "off",
			"jsdoc/require-returns-description" : "off",
			"jsdoc/require-property-description" : "off",
		},
	},
	{
		settings : {
			"import-x/parsers" : {
				"espree" : [ ".js" ],
				"svelte-eslint-parser" : [ ".svelte", ".svelte.js" ],
			},
			"import-x/resolver-next" : [
				createTypeScriptImportResolver({
					project : "jsconfig.json",
				}),
			],
		},
	},
]);
