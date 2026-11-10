// tokens.css 밖의 CSS·JSX에서 색 코드, px 값, 금지된 꾸밈을 쓰면 실패시킨다.
// 왜: 디자인 규칙을 사람의 눈이 아니라 도구로 잡기 위해서다. (npm run check:tokens)
// [라이브러리] node:fs: 파일 내용을 읽는다 (자세한 이유는 fileList.js)
import { readFileSync } from 'node:fs';
// node:path: 토큰 파일 경로를 운영체제에 맞게 만든다
import { join } from 'node:path';
import { listFiles } from './fileList.js';
import { findTokenProblems } from './tokenRules.js';

const TOKEN_FILE = join('src', 'styles', 'tokens.css');
const files = listFiles('src', /\.(css|jsx)$/).filter((file) => file !== TOKEN_FILE);

const messages = [];
for (const file of files) {
  for (const problem of findTokenProblems(readFileSync(file, 'utf8'))) {
    messages.push(`${file}:${problem.lineNumber} ${problem.ruleName}: ${problem.line}`);
  }
}

if (messages.length > 0) {
  console.error(messages.join('\n'));
  console.error(`\n토큰 검사 실패: ${messages.length}건`);
  process.exit(1);
}
console.log(`토큰 검사 통과 (${files.length}개 파일)`);
