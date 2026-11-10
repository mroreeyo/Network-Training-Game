// 라이브러리 import 바로 위 줄이 주석이 아니면 실패시킨다 (개발 규칙 3).
// 상대 경로(./, ../)와 CSS 파일 import는 라이브러리가 아니므로 검사하지 않는다.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

function listFiles(folder) {
  const files = [];
  for (const name of readdirSync(folder)) {
    const path = join(folder, name);
    if (statSync(path).isDirectory()) {
      files.push(...listFiles(path));
    } else if (/\.(js|jsx)$/.test(name)) {
      files.push(path);
    }
  }
  return files;
}

function isLibraryImport(line) {
  const match = line.match(/^import\s.*from\s+['"]([^'"]+)['"]/);
  if (!match) return false;
  return !match[1].startsWith('.');
}

function isComment(line) {
  return line.trim().startsWith('//');
}

function findProblems(file) {
  const problems = [];
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, index) => {
    if (!isLibraryImport(line)) return;
    const previousLine = index > 0 ? lines[index - 1] : '';
    if (!isComment(previousLine)) {
      problems.push(`${file}:${index + 1} 사용 이유 주석이 없어요: ${line.trim()}`);
    }
  });
  return problems;
}

const files = ['src'].flatMap(listFiles);
const problems = files.flatMap(findProblems);
if (problems.length > 0) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`import 주석 검사 통과 (${files.length}개 파일)`);
