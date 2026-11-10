// 디자인 토큰 규칙: tokens.css 밖에서는 색 코드, px 값, 금지된 꾸밈을 쓰지 않는다.
// 판정만 하는 순수 함수라서 테스트할 수 있다. 파일을 읽는 일은 check-tokens.js가 한다.

// CSS는 대문자로 써도(RGB, PX) 똑같이 동작해서 모든 규칙이 대소문자를 가리지 않는다(i).
const FORBIDDEN = [
  // 색상 코드는 3, 4, 6, 8자리뿐이다. &#039; 같은 HTML 문자 코드는 색이 아니라서 뺀다.
  { name: '색상 코드', pattern: /(?<!&)#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})\b/i },
  { name: 'rgb/hsl 색', pattern: /\b(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color-mix)\(/i },
  { name: 'px 값', pattern: /\b\d+(\.\d+)?px\b/i },
  { name: '그라데이션', pattern: /gradient/i },
  // JSX의 style에서는 boxShadow처럼 붙여 쓰므로 - 가 없어도 잡는다.
  { name: '그림자', pattern: /box-?shadow|text-?shadow|drop-shadow/i },
  { name: '흐림 효과', pattern: /backdrop-?filter/i },
];

// 문자열, 여러 줄 주석, 한 줄 주석 중 왼쪽에서 먼저 시작하는 것을 차례로 찾는다.
// 문자열도 같이 찾는 이유: "image/*" 같은 문자열 안의 /* 를 주석 시작으로 착각하면
// 다음 */ 가 나올 때까지의 코드가 통째로 검사에서 빠진다.
// 한 줄 주석은 줄 맨 앞이나 빈칸 뒤의 // 만 본다. https:// 의 // 는 주석이 아니다.
const STRING_OR_COMMENT = /"[^"\n]*"|'[^'\n]*'|\/\*[\s\S]*?\*\/|(?<=^|[ \t])\/\/.*$/gm;

function isCommentText(found) {
  return found.startsWith('/*') || found.startsWith('//');
}

// 주석에는 설명하려고 숫자나 색 코드를 적을 수 있어서 검사하지 않는다.
// 줄 번호가 바뀌지 않도록 주석 안의 줄바꿈은 남긴다.
function stripComments(text) {
  return text.replace(STRING_OR_COMMENT, (found) => {
    if (isCommentText(found)) {
      return found.replace(/[^\n]/g, '');
    }
    return found;
  });
}

// @media 조건 안에는 CSS 문법상 토큰을 쓸 수 없어서 조건 부분({ 앞까지)만 검사에서 뺀다.
// 같은 줄의 { 뒤에 쓴 값은 그대로 검사한다.
function removeMediaCondition(line) {
  return line.replace(/@media[^{]*/i, '');
}

function findForbiddenInLine(line) {
  const checkedPart = removeMediaCondition(line);
  const names = [];
  for (const rule of FORBIDDEN) {
    if (rule.pattern.test(checkedPart)) {
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
