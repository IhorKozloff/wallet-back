module.exports = {
    env: {
        'browser': true,
        'es2021': true,
        'jest': true
    },
    root: true,
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        'ecmaVersion': 'latest',
        'sourceType': 'module',
        'project': './tsconfig.json'
    },
    plugins: [
        "@typescript-eslint"
    ],
    rules: {
        quotes: ['warn', 'single'],
        'jsx-quotes': ['warn', 'prefer-double'],
        indent: ['warn', 4],
        semi: ['warn'],
        'key-spacing': ['warn', { 'beforeColon': false }],
        'no-multiple-empty-lines': ['warn', { 'max': 1, 'maxEOF': 0 }],
        '@typescript-eslint/no-unused-vars': [
            'warn',
            {
                'argsIgnorePattern': '^_',
                'varsIgnorePattern': '^_'
            }
        ],
    }
};
