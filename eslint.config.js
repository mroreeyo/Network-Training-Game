// [라이브러리] @eslint/js
// 왜: 개발 규칙(함수 30줄, 삼항 연산자 중첩 금지)을 사람이 아니라 도구가 확인하게 하려고 쓴다.
//     직접 검사 코드를 만드는 것보다 널리 쓰는 규칙 모음을 쓰는 편이 읽기 쉽다.
// 어디에: npm run lint
import js from '@eslint/js';
// eslint-plugin-react: JSX에서 쓴 컴포넌트를 "안 쓰는 변수"로 잘못 잡지 않게 한다
import react from 'eslint-plugin-react';
// eslint-plugin-react-hooks: useState, useEffect를 잘못 쓰는 실수를 잡는다
import reactHooks from 'eslint-plugin-react-hooks';
// globals: document, process 같은 브라우저·Node 기본 이름을 ESLint에 알려 준다
import globals from 'globals';

export default [
  { ignores: ['dist', 'node_modules'] },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    plugins: { react, 'react-hooks': reactHooks },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react/jsx-uses-vars': 'error',
      // 개발 규칙 1-1: 함수는 30줄 이하 (빈 줄과 주석은 세지 않는다)
      'max-lines-per-function': ['error', { max: 30, skipBlankLines: true, skipComments: true }],
      // 개발 규칙 1-3: 삼항 연산자 중첩 금지
      'no-nested-ternary': 'error',
    },
  },
  {
    // 테스트는 describe 하나에 여러 경우를 모으므로 줄 수 제한을 두지 않는다.
    files: ['**/*.test.js'],
    rules: { 'max-lines-per-function': 'off' },
  },
];
