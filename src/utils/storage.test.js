// [라이브러리] vitest
// 왜: 저장 실패 상황(손상된 값, 사생활 보호 모드)을 화면 없이 확인하려고 쓴다.
// 어디에: utils/storage.js 테스트
import { describe, expect, it } from 'vitest';
import { clearProgress, createEmptyProgress, loadProgress, saveProgress, STORAGE_KEY } from './storage.js';

function makeFakeStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      data[key] = value;
    },
    removeItem: (key) => {
      delete data[key];
    },
  };
}

const brokenStorage = {
  getItem: () => {
    throw new Error('사용할 수 없어요');
  },
  setItem: () => {
    throw new Error('사용할 수 없어요');
  },
  removeItem: () => {
    throw new Error('사용할 수 없어요');
  },
};

describe('storage', () => {
  it('저장한 진행도를 그대로 읽는다', () => {
    const storage = makeFakeStorage();
    const progress = { ...createEmptyProgress(), seenTutorials: ['packet'] };
    saveProgress(progress, storage);
    expect(loadProgress(storage)).toEqual(progress);
  });
  it('저장된 값이 없으면 빈 진행도', () => {
    expect(loadProgress(makeFakeStorage())).toEqual(createEmptyProgress());
  });
  it('손상된 값이면 빈 진행도', () => {
    const storage = makeFakeStorage({ [STORAGE_KEY]: '{깨진 값' });
    expect(loadProgress(storage)).toEqual(createEmptyProgress());
  });
  it('모양이 다른 값이면 빈 진행도', () => {
    const storage = makeFakeStorage({ [STORAGE_KEY]: JSON.stringify({ version: 9 }) });
    expect(loadProgress(storage)).toEqual(createEmptyProgress());
  });
  it('저장소를 못 쓰면 던지지 않고 실패만 알린다', () => {
    expect(loadProgress(brokenStorage)).toEqual(createEmptyProgress());
    expect(saveProgress(createEmptyProgress(), brokenStorage)).toBe(false);
    expect(clearProgress(brokenStorage)).toBe(false);
  });
  it('지우면 빈 진행도로 돌아간다', () => {
    const storage = makeFakeStorage();
    saveProgress({ ...createEmptyProgress(), seenTutorials: ['packet'] }, storage);
    clearProgress(storage);
    expect(loadProgress(storage)).toEqual(createEmptyProgress());
  });
});
