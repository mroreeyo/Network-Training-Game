// 라이브러리 import 바로 위 줄에 사용 이유 주석이 없으면 실패시킨다 (개발 규칙 3).
// (npm run check:imports)
// [라이브러리] node:fs: 파일 내용을 읽는다 (자세한 이유는 fileList.js)
import { readFileSync } from 'node:fs';
import { listFiles } from './fileList.js';
import { findMissingImportComments } from './importCommentRules.js';

// 프로젝트 맨 위의 설정 파일도 라이브러리를 불러오므로 함께 검사한다.
const ROOT_CONFIG_FILES = ['vite.config.js', 'eslint.config.js'];
const files = [...listFiles('src', /\.(js|jsx)$/), ...listFiles('scripts', /\.js$/), ...ROOT_CONFIG_FILES];

const messages = [];
for (const file of files) {
  for (const problem of findMissingImportComments(readFileSync(file, 'utf8'))) {
    messages.push(`${file}:${problem.lineNumber} 사용 이유 주석이 없어요: ${problem.line}`);
  }
}

if (messages.length > 0) {
  console.error(messages.join('\n'));
  console.error(`\nimport 주석 검사 실패: ${messages.length}건`);
  process.exit(1);
}
console.log(`import 주석 검사 통과 (${files.length}개 파일)`);
