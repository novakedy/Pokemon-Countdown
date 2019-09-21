module.exports = {
  root: true,
  extends: '@react-native-community',
  parser: 'babel-eslint',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
      modules: true,
    },
  },
  extends: ['prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
    useTabs: true,
    indent: [2, 'tab'],
    'no-tabs': 0,
  },
};
