// 스테이지를 깨면 보여 주는 개념 요약 카드(3줄)다. 도감 화면에서도 다시 볼 수 있다.
// 학습자가 그대로 외우는 문장이라서 네트워크 사실과 맞는지 따로 확인한다.
// 카드 모양: { id, chapterId, stageNumber, title, lines: [3줄] }
// 챕터별 카드는 그 챕터의 스테이지를 만들 때 추가한다.
export const conceptCards = [];

export function findConceptCard(chapterId, stageNumber) {
  return conceptCards.find((card) => {
    return card.chapterId === chapterId && card.stageNumber === stageNumber;
  });
}
