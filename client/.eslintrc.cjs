module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  extends: ['eslint:recommended', 'plugin:react/recommended'],
  plugins: ['react-refresh', 'react'],
  settings: { react: { version: 'detect' } },
  parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
  rules: { 'react-refresh/only-export-components': 'warn', 'react/prop-types': 'off' }
}
