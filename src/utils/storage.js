// 진행도 읽기·쓰기는 이 파일 한 곳에서만 한다 (localStorage는 서버가 없는 저장소다).

export const STORAGE_KEY = 'network-game-progress';

// version을 두는 이유: 나중에 저장 형태가 바뀌어도 예전 기록을 옮길 수 있게 하기 위해서다.
export function createEmptyProgress() {
  return { version: 1, clearedStages: {}, seenTutorials: [] };
}

// 쿠키를 막아 둔 브라우저는 window.localStorage를 읽기만 해도 오류를 던진다.
// 기본값을 매개변수 자리에 두면 try 밖에서 오류가 나므로, try 안에서 이 함수로 저장소를 고른다.
function pickStorage(storage) {
  if (storage === undefined) {
    return window.localStorage;
  }
  return storage;
}

// 별점은 1~3개만 있다 (PRD 별점 기준).
function isValidStageRecord(record) {
  if (record === null || typeof record !== 'object') {
    return false;
  }
  return Number.isInteger(record.stars) && record.stars >= 1 && record.stars <= 3;
}

// 기록 하나하나를 확인하는 이유: 손상된 기록({ 'packet-1': null })이 섞여 있으면
// 별점을 읽는 화면이 열 때마다 멈추기 때문이다.
function isValidClearedStages(clearedStages) {
  if (clearedStages === null || typeof clearedStages !== 'object') {
    return false;
  }
  if (Array.isArray(clearedStages)) {
    return false;
  }
  return Object.values(clearedStages).every(isValidStageRecord);
}

function isValidProgress(value) {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  if (value.version !== 1) {
    return false;
  }
  if (!isValidClearedStages(value.clearedStages)) {
    return false;
  }
  return Array.isArray(value.seenTutorials);
}

// 사생활 보호 모드나 손상된 값으로 읽기에 실패하면 게임을 막지 않고 빈 진행도로 시작한다.
export function loadProgress(storage) {
  try {
    const text = pickStorage(storage).getItem(STORAGE_KEY);
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
export function saveProgress(progress, storage) {
  try {
    pickStorage(storage).setItem(STORAGE_KEY, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}

export function clearProgress(storage) {
  try {
    pickStorage(storage).removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
