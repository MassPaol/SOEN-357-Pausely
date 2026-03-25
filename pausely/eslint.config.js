const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');
const prettierPlugin = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  // 1. Load the old "expo" config through the translator
  ...compat.extends('expo'),

  // 2. Define modern flat rules
  {
    languageOptions: {
      globals: {
        __dirname: 'readonly', // This fixes the __dirname error
      },
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      ...prettierConfig.rules,
      'prettier/prettier': 'error',
      'no-unused-vars': 'warn',
    },
  },
];
