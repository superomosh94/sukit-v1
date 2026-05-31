module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: true,
    babelOptions: {
      presets: ['@babel/preset-react'],
    },
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['react'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // Customize rules as needed
    'react/prop-types': 'off',
    'no-unused-vars': ['warn', { args: 'after-used', argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['error'] }],
  },
  ignorePatterns: ['node_modules/', 'dist/'],
};
