// Value changes (assignments, ++/--) sit in their own blank-line-separated group,
// the same way variable declarations do.
const isValueChange = (statement) => {
	return statement.type === "ExpressionStatement"
		&& (statement.expression.type === "AssignmentExpression" || statement.expression.type === "UpdateExpression");
};

export const paddedAssignments = {
	meta : {
		type : "layout",
		fixable : "whitespace",
		messages : {
			missing : "Expected a blank line between value changes and other statements.",
		},
	},

	create(context) {
		const source = context.sourceCode;

		const checkStatements = (statements) => {
			for(let index = 1; index < statements.length; index++) {
				const previous = statements[index - 1];
				const statement = statements[index];

				if(isValueChange(previous) === isValueChange(statement)) {
					continue;
				}

				const last = source.getLastToken(previous);
				const next = source.getTokenAfter(last, { includeComments : true });

				if(next.loc.start.line - last.loc.end.line < 2) {
					context.report({
						node : statement,
						messageId : "missing",
						fix : (fixer) => {
							return fixer.insertTextAfter(last, "\n");
						},
					});
				}
			}
		};

		return {
			Program(node) {
				checkStatements(node.body);
			},

			BlockStatement(node) {
				checkStatements(node.body);
			},

			SwitchCase(node) {
				checkStatements(node.consequent);
			},
		};
	},
};
