module.exports = {
    env: {
        browser: true,
        commonjs: true,
    },

    extends: ['@broxus'],

    overrides: [
        {
            files: ['*.d.ts', '**/*/types.ts'],
            rules: {
                camelcase: 'off',
                'max-len': 'off',
            },
        },
        {
            files: ['*.abi.ts'],
            rules: {
                camelcase: 'off',
                'max-len': 'off',
                'sort-keys': 'off',
            },
        },
    ],

    root: true,

    rules: {
        'import/extensions': ['error', 'never', { json: 'always', scss: 'always' }],
        'no-await-in-loop': 'off',
        'no-restricted-syntax': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
    },

    settings: {
        'import/extensions': ['.ts', '.tsx', '.js', '.scss', '.css'],
        'import/resolver': {
            'eslint-import-resolver-webpack': {},
            node: {
                extensions: ['.js', '.jsx'],
            },
        },
    },
}
