// [라이브러리] vitest: 저장 실패 상황(손상된 값, 사생활 보호 모드)을 화면 없이 테스트한다 (자세한 이유는 scripts/tokenRules.test.js)
import { afterEach, describe, expect, it, vi } from 'vitest';
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
  it('기록 하나가 손상돼 있으면 빈 진행도', () => {
    const badRecords = [null, {}, { stars: '3' }, { stars: 0 }, { stars: 4 }];
    badRecords.forEach((record) => {
      const saved = { ...createEmptyProgress(), clearedStages: { 'packet-1': record } };
      const storage = makeFakeStorage({ [STORAGE_KEY]: JSON.stringify(saved) });
      expect(loadProgress(storage)).toEqual(createEmptyProgress());
    });
  });
  it('clearedStages가 배열이면 빈 진행도', () => {
    const saved = { ...createEmptyProgress(), clearedStages: [] };
    const storage = makeFakeStorage({ [STORAGE_KEY]: JSON.stringify(saved) });
    expect(loadProgress(storage)).toEqual(createEmptyProgress());
  });
  it('별점이 1~3개인 기록은 그대로 읽는다', () => {
    const saved = { ...createEmptyProgress(), clearedStages: { 'packet-1': { stars: 1 }, 'packet-2': { stars: 3 } } };
    const storage = makeFakeStorage({ [STORAGE_KEY]: JSON.stringify(saved) });
    expect(loadProgress(storage)).toEqual(saved);
  });
  it('지우면 빈 진행도로 돌아간다', () => {
    const storage = makeFakeStorage();
    saveProgress({ ...createEmptyProgress(), seenTutorials: ['packet'] }, storage);
    clearProgress(storage);
    expect(loadProgress(storage)).toEqual(createEmptyProgress());
  });
});

// 저장소를 넘기지 않으면 브라우저의 window.localStorage를 쓴다.
describe('브라우저 저장소', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });
  it('저장소를 넘기지 않으면 window.localStorage를 쓴다', () => {
    vi.stubGlobal('window', { localStorage: makeFakeStorage() });
    const progress = { ...createEmptyProgress(), seenTutorials: ['packet'] };
    expect(saveProgress(progress)).toBe(true);
    expect(loadProgress()).toEqual(progress);
    expect(clearProgress()).toBe(true);
    expect(loadProgress()).toEqual(createEmptyProgress());
  });
  it('window.localStorage를 읽기만 해도 오류가 나는 브라우저에서 던지지 않는다', () => {
    const blockedWindow = {
      get localStorage() {
        throw new Error('저장소 접근이 막혀 있어요');
      },
    };
    vi.stubGlobal('window', blockedWindow);
    expect(loadProgress()).toEqual(createEmptyProgress());
    expect(saveProgress(createEmptyProgress())).toBe(false);
    expect(clearProgress()).toBe(false);
  });
});
