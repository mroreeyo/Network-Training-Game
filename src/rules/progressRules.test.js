// [라이브러리] vitest
// 왜: 게임 규칙을 화면 없이 따로 테스트하려고 쓴다. Vite와 설정을 공유해서 추가 설정이 거의 없다.
// 어디에: rules/, utils/ 폴더의 테스트
import { describe, expect, it } from 'vitest';
import {
  calculateStars,
  countClearedStages,
  getEarnedConceptCards,
  isChapterUnlocked,
  isStageUnlocked,
  mergeBestStars,
} from './progressRules.js';

const chapters = [
  { id: 'packet', stageCount: 5 },
  { id: 'subnet', stageCount: 5 },
  { id: 'firewall', stageCount: 5 },
];

function makeProgress(keys) {
  const clearedStages = {};
  keys.forEach((key) => {
    clearedStages[key] = { stars: 1 };
  });
  return { version: 1, clearedStages, seenTutorials: [] };
}

const allPacket = ['packet-1', 'packet-2', 'packet-3', 'packet-4', 'packet-5'];

describe('calculateStars', () => {
  it('힌트도 실수도 없으면 3개', () => {
    expect(calculateStars({ hintsUsed: 0, mistakeCount: 0 })).toBe(3);
  });
  it('힌트를 1단계든 2단계든 쓰면 1개만 잃는다', () => {
    expect(calculateStars({ hintsUsed: 1, mistakeCount: 0 })).toBe(2);
    expect(calculateStars({ hintsUsed: 2, mistakeCount: 0 })).toBe(2);
  });
  it('힌트도 쓰고 실수도 했으면 1개', () => {
    expect(calculateStars({ hintsUsed: 2, mistakeCount: 3 })).toBe(1);
  });
});

describe('mergeBestStars', () => {
  it('기록이 없으면 새 별점', () => {
    expect(mergeBestStars(undefined, 2)).toBe(2);
  });
  it('낮은 별점으로 덮어쓰지 않는다', () => {
    expect(mergeBestStars(3, 1)).toBe(3);
    expect(mergeBestStars(1, 3)).toBe(3);
  });
});

describe('해금', () => {
  it('챕터 1은 항상 열려 있다', () => {
    expect(isChapterUnlocked(makeProgress([]), chapters, 'packet')).toBe(true);
  });
  it('앞 챕터를 4개만 깨면 다음 챕터는 닫혀 있다', () => {
    const progress = makeProgress(allPacket.slice(0, 4));
    expect(isChapterUnlocked(progress, chapters, 'subnet')).toBe(false);
  });
  it('앞 챕터를 모두 깨면 다음 챕터가 열린다', () => {
    expect(isChapterUnlocked(makeProgress(allPacket), chapters, 'subnet')).toBe(true);
  });
  it('모르는 챕터는 닫혀 있다', () => {
    expect(isChapterUnlocked(makeProgress([]), chapters, 'unknown')).toBe(false);
  });
  it('스테이지는 앞 스테이지를 깨야 열린다', () => {
    const progress = makeProgress(['packet-1']);
    expect(isStageUnlocked(progress, 'packet', 1)).toBe(true);
    expect(isStageUnlocked(progress, 'packet', 2)).toBe(true);
    expect(isStageUnlocked(progress, 'packet', 3)).toBe(false);
  });
});

describe('진행률과 개념 카드', () => {
  it('깬 스테이지 수를 센다', () => {
    const progress = makeProgress(['packet-1', 'packet-3', 'subnet-1']);
    expect(countClearedStages(progress, chapters[0])).toBe(2);
  });
  it('깬 스테이지의 개념 카드만 돌려준다', () => {
    const cards = [
      { id: 'a', chapterId: 'packet', stageNumber: 1 },
      { id: 'b', chapterId: 'packet', stageNumber: 2 },
    ];
    const earned = getEarnedConceptCards(makeProgress(['packet-2']), cards);
    expect(earned.map((card) => card.id)).toEqual(['b']);
  });
});
