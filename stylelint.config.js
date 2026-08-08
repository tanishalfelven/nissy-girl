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

		// footgun for 3d, prefer util backface helper
		"declaration-property-value-disallowed-list" : {
			"backface-visibility" : "visible",
		},
	},
};
