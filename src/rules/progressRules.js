// 챕터 해금, 별점, 개념 카드처럼 모든 챕터가 같이 쓰는 진행 규칙이다.
// 화면 코드가 없는 순수 함수라서 따로 테스트할 수 있다.

export function makeStageKey(chapterId, stageNumber) {
  return `${chapterId}-${stageNumber}`;
}

// 별점 = 클리어 1개 + 힌트 미사용 1개 + 실수 없음 1개.
// 힌트는 1단계를 쓰든 2단계를 쓰든 "힌트 미사용" 별 하나만 잃는다.
export function calculateStars({ hintsUsed, mistakeCount }) {
  let stars = 1;
  if (hintsUsed === 0) {
    stars += 1;
  }
  if (mistakeCount === 0) {
    stars += 1;
  }
  return stars;
}

// 같은 스테이지를 다시 깼을 때 더 낮은 별점으로 덮어쓰지 않는다.
export function mergeBestStars(previousStars, newStars) {
  if (previousStars === undefined) {
    return newStars;
  }
  return Math.max(previousStars, newStars);
}

export function isStageCleared(progress, chapterId, stageNumber) {
  const key = makeStageKey(chapterId, stageNumber);
  return progress.clearedStages[key] !== undefined;
}

export function getStageStars(progress, chapterId, stageNumber) {
  const key = makeStageKey(chapterId, stageNumber);
  const record = progress.clearedStages[key];
  if (record === undefined) {
    return 0;
  }
  return record.stars;
}

export function countClearedStages(progress, chapter) {
  let count = 0;
  for (let stageNumber = 1; stageNumber <= chapter.stageCount; stageNumber += 1) {
    if (isStageCleared(progress, chapter.id, stageNumber)) {
      count += 1;
    }
  }
  return count;
}

// 스테이지가 하나도 없는 챕터(아직 만들지 않은 챕터)는 깬 것으로 보지 않는다.
// 0개 중 0개를 "모두 깼다"고 보면 다음 챕터가 바로 열려 버린다.
export function isChapterCleared(progress, chapter) {
  if (chapter.stageCount === 0) {
    return false;
  }
  return countClearedStages(progress, chapter) === chapter.stageCount;
}

// 챕터 1은 항상 열려 있고, 나머지는 앞 챕터를 모두 깨야 열린다.
// 바로 앞 챕터만 보지 않는 이유: 앞 챕터에 스테이지가 늘어나 예전 기록이 모자라게 되면
// 챕터 2는 닫혔는데 챕터 3은 열리는 일이 생기기 때문이다.
export function isChapterUnlocked(progress, chapters, chapterId) {
  const index = chapters.findIndex((chapter) => chapter.id === chapterId);
  if (index === -1) {
    return false;
  }
  const previousChapters = chapters.slice(0, index);
  return previousChapters.every((chapter) => isChapterCleared(progress, chapter));
}

// 스테이지 1은 항상 열려 있고, 나머지는 바로 앞 스테이지를 깨야 열린다.
// 챕터가 열려 있는지는 여기서 보지 않으므로, 화면에서는 isChapterUnlocked를 먼저 확인한다.
export function isStageUnlocked(progress, chapterId, stageNumber) {
  // 주소에서 읽은 스테이지 번호는 글자('1')라서 숫자로 바꾼 뒤 비교한다.
  const number = Number(stageNumber);
  if (number === 1) {
    return true;
  }
  return isStageCleared(progress, chapterId, number - 1);
}

// 개념 카드는 저장하지 않고 클리어 기록에서 계산한다.
// 같은 사실을 두 곳에 저장하면 서로 어긋날 수 있기 때문이다.
export function getEarnedConceptCards(progress, conceptCards) {
  return conceptCards.filter((card) => {
    return isStageCleared(progress, card.chapterId, card.stageNumber);
  });
}
