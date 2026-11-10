// 개발 규칙 3: 라이브러리를 import하는 줄 바로 위에는 사용 이유 주석이 있어야 한다.
// 판정만 하는 순수 함수라서 테스트할 수 있다. 파일을 읽는 일은 check-import-comments.js가 한다.

// import 문이 시작하는 줄인지 본다. import.meta 나 import('...') 는 import 문이 아니다.
function startsImport(line) {
  return /^import[\s'"{*]/.test(line);
}

// import가 여러 줄에 걸쳐 있으면 따옴표(불러오는 곳)가 나오는 줄까지 한 줄로 이어 붙인다.
// 이름을 여러 개 불러오면 줄이 나뉘어서, 한 줄만 보면 라이브러리 이름을 찾지 못한다.
function joinImportLines(lines, startIndex) {
  let statement = lines[startIndex];
  let index = startIndex;
  while (!/['"]/.test(statement) && index + 1 < lines.length) {
    index += 1;
    statement = `${statement} ${lines[index].trim()}`;
  }
  return statement;
}

// 상대 경로(./, ../)로 불러오는 것은 우리 코드라서 라이브러리가 아니다.
// from 없이 불러오는 것(import 'library/style.css')도 라이브러리면 이름을 돌려준다.
function getLibraryName(statement) {
  const match = statement.match(/^import\s*(?:.*\bfrom\s*)?['"]([^'"]+)['"]/);
  if (!match || match[1].startsWith('.')) {
    return null;
  }
  return match[1];
}

// 한 줄 주석(//)과 여러 줄 주석의 마지막 줄(*/로 끝남)을 주석으로 본다.
function isComment(line) {
  const trimmed = line.trim();
  return trimmed.startsWith('//') || trimmed.endsWith('*/');
}

// 파일 내용을 받아서 주석이 없는 라이브러리 import를 { lineNumber, line } 목록으로 돌려준다.
// 여러 줄 import는 import가 시작하는 줄의 번호와 내용을 돌려준다.
export function findMissingImportComments(text) {
  const problems = [];
  const lines = text.split('\n');
  lines.forEach((line, index) => {
    if (!startsImport(line) || getLibraryName(joinImportLines(lines, index)) === null) {
      return;
    }
    const previousLine = index > 0 ? lines[index - 1] : '';
    if (!isComment(previousLine)) {
      problems.push({ lineNumber: index + 1, line: line.trim() });
    }
  });
  return problems;
}
