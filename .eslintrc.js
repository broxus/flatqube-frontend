// const typescriptConfig = {
//     ...baseConfig,
//     extends: [
//         ...baseConfig.extends,
//         'plugin:import/typescript',
//     ],
//     overrides: [
//         {
//             files: ['*.d.ts', '**/*/types.ts'],
//             rules: {
//                 camelcase: 'off',
//                 'max-len': 'off',
//             },
//         },
//         {
//             files: ['*.ts{,x}'],
//             ...baseConfig,
//             parser: '@typescript-eslint/parser', // Specifies the ESLint parser
//             plugins: [...baseConfig.plugins, '@typescript-eslint'],
//             parserOptions: {
//                 ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
//                 sourceType: 'module', // Allows for the use of imports
//                 ecmaFeatures: {
//                     jsx: true, // Allows for the parsing of JSX
//                 },
//             },
//             rules: {
//                 ...typescriptEslintRecommended.rules,
//                 ...baseConfig.rules,
//                 '@typescript-eslint/ban-types': 'off',
//                 '@typescript-eslint/ban-ts-ignore': 'off',
//                 '@typescript-eslint/ban-ts-comment': ['error', {
//                     'ts-expect-error': 'allow-with-description',
//                     'ts-ignore': false,
//                     'ts-nocheck': true,
//                     'ts-check': false,
//                     minimumDescriptionLength: 5,
//                 }],
//                 '@typescript-eslint/explicit-function-return-type': ['off', {
//                     allowExpressions: true,
//                     allowHigherOrderFunctions: true,
//                     allowTypedFunctionExpressions: true,
//                 }],
//                 '@typescript-eslint/explicit-module-boundary-types': ['warn', {
//                     allowArgumentsExplicitlyTypedAsAny: true,
//                     allowTypedFunctionExpressions: true,
//                 }],
//                 '@typescript-eslint/no-dupe-class-members': 'error',
//                 '@typescript-eslint/no-empty-function': ['error', {
//                     allow: ['methods'],
//                 }],
//                 '@typescript-eslint/no-explicit-any': 'off',
//                 '@typescript-eslint/no-inferrable-types': 'off',
//                 '@typescript-eslint/no-non-null-assertion': 'off',
//                 '@typescript-eslint/no-shadow': 'error',
//                 '@typescript-eslint/no-unused-vars': ['error', {
//                     argsIgnorePattern: '^_',
//                 }],
//                 '@typescript-eslint/no-use-before-define': 'error',
//                 '@typescript-eslint/lines-between-class-members': ['error', 'always', {
//                     exceptAfterOverload: true,
//                 }],
//                 camelcase: 'off',
//                 'lines-between-class-members': 'off',
//                 'no-dupe-class-members': 'off',
//                 'no-redeclare': 'off',
//                 'no-shadow': 'off',
//                 'no-undef': 'off',
//                 'no-unused-vars': 'off',
//                 'no-use-before-define': 'off',
//                 'no-useless-constructor': 'off',
//                 'react/prop-types': 'off',
//                 'unused-imports/no-unused-vars': 'off',
//                 'unused-imports/no-unused-imports': 'off',
//                 'unused-imports/no-unused-vars-ts': ['warn', {
//                     argsIgnorePattern: '^_',
//                     args: 'all',
//                     ignoreRestSiblings: true,
//                 }],
//                 'unused-imports/no-unused-imports-ts': 'error',
//             },
//             settings: {
//                 'import/parsers': {
//                     '@typescript-eslint/parser': ['.ts', '.tsx', '.d.ts'],
//                 },
//                 'import/external-module-folders': [
//                     'node_modules',
//                     'node_modules/@types',
//                 ],
//                 'import/resolver': {
//                     typescript: {},
//                     node: {
//                         // Allow import and resolve for *.ts modules.
//                         extensions: ['.js', '.jsx', '.mjs', '.ts', '.tsx'],
//                     },
//                 },
//                 'import/extensions': ['.js', '.jsx', '.mjs', '.ts', '.tsx'],
//             },
//         },
//     ],
// }

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
