// 검사 스크립트가 같이 쓰는 파일 찾기 함수다.
// [라이브러리] node:fs, node:path (Node.js 기본 기능)
// 왜: 폴더 안의 파일을 읽으려면 필요하고, 따로 설치할 것이 없다.
// 어디에: scripts/ 폴더의 검사 스크립트
import { readdirSync, statSync } from 'node:fs';
// node:path: 운영체제에 맞게 폴더와 파일 이름을 잇는다 (자세한 이유는 위 설명)
import { join } from 'node:path';

// folder 아래의 모든 파일 중에서 이름이 pattern에 맞는 것만 돌려준다.
export function listFiles(folder, pattern) {
  const files = [];
  for (const name of readdirSync(folder)) {
    const path = join(folder, name);
    if (statSync(path).isDirectory()) {
      files.push(...listFiles(path, pattern));
    } else if (pattern.test(name)) {
      files.push(path);
    }
  }
  return files;
}
