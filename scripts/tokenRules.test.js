// [라이브러리] vitest
// 왜: 규칙 함수를 화면 없이 따로 테스트하려고 쓴다. Vite와 설정을 공유해서 추가 설정이 거의 없다.
//     PRD 기술 스택에 테스트 도구가 없어서 개발 의존성으로만 추가했다 (계획서 D3).
// 어디에: scripts/와 src/rules/, src/utils/의 테스트
import { describe, expect, it } from 'vitest';
import { findTokenProblems } from './tokenRules.js';

function ruleNames(text) {
  return findTokenProblems(text).map((problem) => problem.ruleName);
}

describe('findTokenProblems', () => {
  it('토큰만 쓴 CSS는 통과', () => {
    const css = '.card {\n  padding: var(--space-4);\n  line-height: 1.6;\n  max-width: 30em;\n}';
    expect(findTokenProblems(css)).toEqual([]);
  });
  it('색상 코드와 rgb 색을 잡는다', () => {
    expect(ruleNames('color: #16264A;')).toEqual(['색상 코드']);
    expect(ruleNames('color: rgb(0, 0, 0);')).toEqual(['rgb/hsl 색']);
  });
  it('px 값을 잡는다', () => {
    expect(ruleNames('padding: 12px;')).toEqual(['px 값']);
    expect(ruleNames('border-width: 0.5px;')).toEqual(['px 값']);
  });
  it('@media 조건의 px는 허용한다', () => {
    expect(findTokenProblems('@media (max-width: 860px) {')).toEqual([]);
  });
  it('금지된 꾸밈을 잡는다', () => {
    expect(ruleNames('background: linear-gradient(red, blue);')).toEqual(['그라데이션']);
    expect(ruleNames('box-shadow: none;')).toEqual(['그림자']);
    expect(ruleNames('backdrop-filter: blur(2em);')).toEqual(['흐림 효과']);
  });
  it('주석 안의 값은 검사하지 않는다', () => {
    expect(findTokenProblems('/* 2px: 선 굵기 */\n// #FFFFFF는 라벨색')).toEqual([]);
  });
  it('여러 줄 주석 뒤에서도 줄 번호가 맞다', () => {
    const css = '/* 첫 줄\n   둘째 줄 12px */\n.a {\n  margin: 4px;\n}';
    expect(findTokenProblems(css)).toEqual([{ lineNumber: 4, ruleName: 'px 값', line: 'margin: 4px;' }]);
  });
});
