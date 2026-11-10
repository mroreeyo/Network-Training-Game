// 개발 규칙 3: 라이브러리를 import하는 줄 바로 위에는 사용 이유 주석이 있어야 한다.
// 판정만 하는 순수 함수라서 테스트할 수 있다. 파일을 읽는 일은 check-import-comments.js가 한다.

// 상대 경로(./, ../)로 불러오는 것은 우리 코드라서 라이브러리가 아니다.
function getLibraryName(line) {
  const match = line.match(/^import\s.*from\s+['"]([^'"]+)['"]/);
  if (!match || match[1].startsWith('.')) {
    return null;
  }
  return match[1];
}

function isComment(line) {
  return line.trim().startsWith('//');
}

// 파일 내용을 받아서 주석이 없는 라이브러리 import를 { lineNumber, line } 목록으로 돌려준다.
export function findMissingImportComments(text) {
  const problems = [];
  const lines = text.split('\n');
  lines.forEach((line, index) => {
    if (getLibraryName(line) === null) {
      return;
    }
    const previousLine = index > 0 ? lines[index - 1] : '';
    if (!isComment(previousLine)) {
      problems.push({ lineNumber: index + 1, line: line.trim() });
    }
  });
  return problems;
}
