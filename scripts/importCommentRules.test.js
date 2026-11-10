// [라이브러리] vitest: 규칙 함수를 화면 없이 테스트한다 (자세한 이유는 tokenRules.test.js)
import { describe, expect, it } from 'vitest';
import { findMissingImportComments } from './importCommentRules.js';

describe('findMissingImportComments', () => {
  it('바로 위 줄에 주석이 있으면 통과', () => {
    const code = "// [라이브러리] react: 화면 상태를 만든다\nimport { useState } from 'react';";
    expect(findMissingImportComments(code)).toEqual([]);
  });
  it('주석이 없으면 줄 번호와 함께 알려 준다', () => {
    const code = "import { useState } from 'react';";
    expect(findMissingImportComments(code)).toEqual([{ lineNumber: 1, line: code }]);
  });
  it('주석과 import 사이에 다른 줄이 있으면 실패', () => {
    const code = "// 주석\nimport App from './App.jsx';\nimport { useState } from 'react';";
    expect(findMissingImportComments(code).map((problem) => problem.lineNumber)).toEqual([3]);
  });
  it('상대 경로 import와 CSS import는 검사하지 않는다', () => {
    const code = "import App from './App.jsx';\nimport styles from '../Button.module.css';\nimport './styles/tokens.css';";
    expect(findMissingImportComments(code)).toEqual([]);
  });
  it('node: 기본 기능도 라이브러리로 본다', () => {
    expect(findMissingImportComments("import { join } from 'node:path';")).toHaveLength(1);
  });
});
