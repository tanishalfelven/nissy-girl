// Multiline object properties are separated from their neighbours by a blank line.
export const paddedMultilineProperties = {
	meta : {
		type : "layout",
		fixable : "whitespace",
		messages : {
			missing : "Expected a blank line between multiline object properties.",
		},
	},

	create(context) {
		const source = context.sourceCode;

		const isMultiline = (node) => {
			return node.loc.start.line !== node.loc.end.line;
		};

		return {
			ObjectExpression(node) {
				for(let index = 1; index < node.properties.length; index++) {
					const previous = node.properties[index - 1];
					const property = node.properties[index];

					if(!isMultiline(previous) && !isMultiline(property)) {
						continue;
					}

					const comma = source.getTokenAfter(previous);
					const next = source.getTokenAfter(comma, { includeComments : true });

					if(next.loc.start.line - comma.loc.end.line < 2) {
						context.report({
							node : property,
							messageId : "missing",
							fix : (fixer) => {
								return fixer.insertTextAfter(comma, "\n");
							},
						});
					}
				}
			},
		};
	},
};
