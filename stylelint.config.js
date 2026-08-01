export default{
	plugins : [
		"stylelint-order",
		"@stylistic/stylelint-plugin",
	],

	extends : [
		"stylelint-config-standard",
		"@stylistic/stylelint-config",
		"@modular-css/stylelint-config",
		"stylelint-config-clean-order",
	],

	rules : {
		"@stylistic/indentation" : "tab",
		"declaration-property-value-no-unknown" : null,
	},
};
