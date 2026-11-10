// 디자인 토큰 규칙: tokens.css 밖에서는 색 코드, px 값, 금지된 꾸밈을 쓰지 않는다.
// 판정만 하는 순수 함수라서 테스트할 수 있다. 파일을 읽는 일은 check-tokens.js가 한다.

const FORBIDDEN = [
  { name: '색상 코드', pattern: /#[0-9a-fA-F]{3,8}\b/ },
  { name: 'rgb/hsl 색', pattern: /\b(rgba?|hsla?)\(/ },
  { name: 'px 값', pattern: /\b\d+(\.\d+)?px\b/ },
  { name: '그라데이션', pattern: /gradient/ },
  { name: '그림자', pattern: /box-shadow|text-shadow/ },
  { name: '흐림 효과', pattern: /backdrop-filter/ },
];

// 주석에는 설명하려고 숫자나 색 코드를 적을 수 있어서 검사하지 않는다.
// 줄 번호가 바뀌지 않도록 주석 안의 줄바꿈은 남긴다.
function stripComments(text) {
  const withoutBlocks = text.replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, ''));
  return withoutBlocks.replace(/^\s*\/\/.*$/gm, '');
}

function findForbiddenInLine(line) {
  const names = [];
  for (const rule of FORBIDDEN) {
    // @media 조건 안에는 CSS 문법상 토큰을 쓸 수 없어서 px를 허용한다.
    const isMediaWidth = rule.name === 'px 값' && line.includes('@media');
    if (!isMediaWidth && rule.pattern.test(line)) {
      names.push(rule.name);
    }
  }
  return names;
}

// 파일 내용을 받아서 규칙을 어긴 줄을 { lineNumber, ruleName, line } 목록으로 돌려준다.
export function findTokenProblems(text) {
  const problems = [];
  const lines = stripComments(text).split('\n');
  lines.forEach((line, index) => {
    for (const ruleName of findForbiddenInLine(line)) {
      problems.push({ lineNumber: index + 1, ruleName, line: line.trim() });
    }
  });
  return problems;
}
