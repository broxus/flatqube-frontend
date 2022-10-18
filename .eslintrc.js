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

    rules: {
        'no-await-in-loop': 'off',
        'no-restricted-syntax': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
    },

    settings: {
        'import/resolver': {
            'eslint-import-resolver-webpack': {},
            node: {
                extensions: ['.js', '.jsx'],
            },
        },
    },
}
