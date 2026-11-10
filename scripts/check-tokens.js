// tokens.css 밖에서 색 코드, px 값, 금지된 꾸밈(그라데이션, 그림자, 흐림)을 쓰면 실패시킨다.
// 왜: 디자인 규칙을 사람의 눈이 아니라 도구로 잡기 위해서다.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'src';
const TOKEN_FILE = join('src', 'styles', 'tokens.css');
const FORBIDDEN = [
  { name: '색상 코드', pattern: /#[0-9a-fA-F]{3,8}\b/ },
  { name: 'rgb/hsl 색', pattern: /\b(rgba?|hsla?)\(/ },
  { name: 'px 값', pattern: /\b\d+(\.\d+)?px\b/ },
  { name: '그라데이션', pattern: /gradient/ },
  { name: '그림자', pattern: /box-shadow|text-shadow/ },
  { name: '흐림 효과', pattern: /backdrop-filter/ },
];

function listFiles(folder) {
  const files = [];
  for (const name of readdirSync(folder)) {
    const path = join(folder, name);
    if (statSync(path).isDirectory()) {
      files.push(...listFiles(path));
    } else if (/\.(css|jsx)$/.test(name)) {
      files.push(path);
    }
  }
  return files;
}

// 주석 줄은 설명에 숫자나 색 코드가 나올 수 있어서 검사하지 않는다.
function stripComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

function findProblems(file) {
  const problems = [];
  const lines = stripComments(readFileSync(file, 'utf8')).split('\n');
  lines.forEach((line, index) => {
    for (const rule of FORBIDDEN) {
      // @media 조건 안에는 CSS 문법상 토큰을 쓸 수 없어서 px를 허용한다.
      if (rule.name === 'px 값' && line.includes('@media')) continue;
      if (rule.pattern.test(line)) {
        problems.push(`${file}:${index + 1} ${rule.name}: ${line.trim()}`);
      }
    }
  });
  return problems;
}

const files = listFiles(ROOT).filter((file) => file !== TOKEN_FILE);
const problems = files.flatMap(findProblems);
if (problems.length > 0) {
  console.error(problems.join('\n'));
  console.error(`\n토큰 검사 실패: ${problems.length}건`);
  process.exit(1);
}
console.log(`토큰 검사 통과 (${files.length}개 파일)`);
