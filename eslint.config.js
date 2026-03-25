const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');
const path = require('path'); // Add this for pathing
const prettierPlugin = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');

const compat = new FlatCompat({
  // This tells ESLint to resolve 'expo' relative to the pausely folder
  baseDirectory: path.join(__dirname, 'pausely'), 
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  {
    // Ignore the root node_modules and other junk
    ignores: ["node_modules/**", ".expo/**", "web-build/**"],
  },
  ...compat.extends('expo'),
  {
    languageOptions: {
      globals: {
        __dirname: 'readonly',
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