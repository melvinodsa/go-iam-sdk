module.exports = {
  parser: '@typescript-eslint/parser',
  extends: ['eslint:recommended'],
  plugins: ['@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-undef': 'off', // TypeScript handles this
  },
  env: {
    browser: true,
    es6: true,
    node: true,
    jest: true,
  },
};
