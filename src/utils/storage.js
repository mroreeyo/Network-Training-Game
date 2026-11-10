// 진행도 읽기·쓰기는 이 파일 한 곳에서만 한다 (localStorage는 서버가 없는 저장소다).

export const STORAGE_KEY = 'network-game-progress';

// version을 두는 이유: 나중에 저장 형태가 바뀌어도 예전 기록을 옮길 수 있게 하기 위해서다.
export function createEmptyProgress() {
  return { version: 1, clearedStages: {}, seenTutorials: [] };
}

function isValidProgress(value) {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  if (value.version !== 1) {
    return false;
  }
  if (value.clearedStages === null || typeof value.clearedStages !== 'object') {
    return false;
  }
  return Array.isArray(value.seenTutorials);
}

// 사생활 보호 모드나 손상된 값으로 읽기에 실패하면 게임을 막지 않고 빈 진행도로 시작한다.
export function loadProgress(storage = window.localStorage) {
  try {
    const text = storage.getItem(STORAGE_KEY);
    if (text === null) {
      return createEmptyProgress();
    }
    const value = JSON.parse(text);
    return isValidProgress(value) ? value : createEmptyProgress();
  } catch {
    return createEmptyProgress();
  }
}

// 저장에 실패해도 플레이는 계속할 수 있어야 해서 성공 여부만 돌려준다.
export function saveProgress(progress, storage = window.localStorage) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}

export function clearProgress(storage = window.localStorage) {
  try {
    storage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
