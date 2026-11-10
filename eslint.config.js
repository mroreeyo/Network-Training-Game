// [라이브러리] @eslint/js, eslint-plugin-react, eslint-plugin-react-hooks, globals
// 왜: 개발 규칙(30줄 함수, 중첩 삼항 금지)을 사람이 아니라 도구가 확인하게 하려고 쓴다.
//     직접 검사 코드를 만들기보다 널리 쓰는 규칙 모음을 쓰는 편이 읽기 쉽다.
// 어디에: npm run lint
import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}', 'scripts/**/*.js', '*.js'],
    plugins: { react, 'react-hooks': reactHooks },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.node },
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react/jsx-uses-vars': 'error',
      'react/jsx-uses-react': 'off',
      // 개발 규칙 1-1: 함수는 30줄 이하 (빈 줄과 주석은 세지 않는다)
      'max-lines-per-function': ['error', { max: 30, skipBlankLines: true, skipComments: true }],
      // 개발 규칙 1-3: 삼항 연산자 중첩 금지
      'no-nested-ternary': 'error',
    },
  },
  { files: ['**/*.test.js'], rules: { 'max-lines-per-function': 'off' } },
  { ignores: ['dist', 'node_modules'] },
];
