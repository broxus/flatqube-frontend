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

    rules: {},

    settings: {
        'import/resolver': {
            'eslint-import-resolver-webpack': {},
            node: {
                extensions: ['.js', '.jsx'],
            },
        },
    },
}
