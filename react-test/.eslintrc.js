module.exports = {
	env: {
		browser: true,
		node: true,
	},
	extends: ['airbnb', 'prettier'],
	plugins: ['prettier'],
	rules: {
		'import/no-unresolved': 'off',
		'no-underscore-dangle': 'off', // ['error', { allowAfterThis: true }],
		'max-classes-per-file': 'off', // ['error', { ignoreExpressions: true, max: 2 }],
		'global-require': 'off',
		'react/react-in-jsx-scope': 0,
		'no-new': 0,
		'no-param-reassign': 0,
		'no-plusplus': 'off', // no-plusplus: ["error", { "allowForLoopAfterthoughts": true }]
		'class-methods-use-this': 'off',
		'react/jsx-filename-extension': 0,
		'import/prefer-default-export': 0,
		'new-cap': 'off',
		'prettier/prettier': [
			'error',
			{
				singleQuote: true,
				semi: true,
				useTabs: true,
				tabWidth: 2,
				trailingComma: 'all',
				printWidth: 80,
				bracketSpacing: true,
				arrowParens: 'avoid',
				endOfLine: 'auto',
			},
		],
	},
};
