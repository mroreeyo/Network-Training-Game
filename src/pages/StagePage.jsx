// [라이브러리] react: 화면 상태(useState)를 만드는 기본 도구 (자세한 이유는 main.jsx)
import { useState } from 'react';
// [라이브러리] react-router-dom: 주소에서 챕터·스테이지 번호를 읽고 다른 화면으로 보내는 도구 (자세한 이유는 App.jsx)
import { Navigate, useParams } from 'react-router-dom';
import ResultModal from '../components/common/ResultModal.jsx';
import StageLayout from '../components/common/StageLayout.jsx';
import Button from '../components/common/Button.jsx';
import PacketBoard from '../chapters/packet/PacketBoard.jsx';
import { chapters, findChapter } from '../data/chapters.js';
import { findConceptCard } from '../data/conceptCards.js';
import {
  calculateStars,
  countClearedStages,
  isChapterUnlocked,
  isStageUnlocked,
} from '../rules/progressRules.js';
import { useProgress } from '../ProgressContext.jsx';

// 챕터를 추가할 때는 게임판 하나만 여기에 등록한다. 별점·저장·결과 화면은 공통이다.
const chapterBoards = {
  packet: PacketBoard,
};

// 커스텀 훅을 쓰는 이유: 힌트·반송 횟수·결과 상태와 그 처리 함수가 길어서,
// 화면 코드(StageSession)와 분리해야 함수 하나를 30줄 안에서 읽을 수 있다.
function useStageAttempt(chapter, stage) {
  const { recordClear } = useProgress();
  const [hintsUsed, setHintsUsed] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [outcome, setOutcome] = useState(null);
  const [boardKey, setBoardKey] = useState(0);

  function handleFinish(result) {
    if (!result.passed) {
      setMistakeCount(mistakeCount + 1);
      setOutcome({ result, stars: 0 });
      return;
    }
    // 실수 횟수는 기본적으로 스테이지에서 반송된 횟수다. 챕터 4처럼 다른 기준이면 결과에 담아 보낸다.
    const mistakes = result.mistakeCount === undefined ? mistakeCount : result.mistakeCount;
    const stars = calculateStars({ hintsUsed, mistakeCount: mistakes });
    recordClear(chapter.id, stage.number, stars);
    setOutcome({ result, stars });
  }

  function handleRetry() {
    setOutcome(null);
    setBoardKey(boardKey + 1);
  }

  function handleUseHint() {
    setHintsUsed(hintsUsed + 1);
  }

  return { hintsUsed, mistakeCount, outcome, boardKey, handleFinish, handleRetry, handleUseHint };
}

// 한 번의 스테이지 도전. 스테이지가 바뀌면 key가 바뀌어서 힌트·반송 횟수가 처음부터 시작된다.
function StageSession({ chapter, stage }) {
  const { progress } = useProgress();
  const attempt = useStageAttempt(chapter, stage);
  const { outcome } = attempt;
  const Board = chapterBoards[chapter.id];
  const hasNext = stage.number < chapter.stageCount && chapter.stages[stage.number] !== undefined;

  return (
    <StageLayout
      chapter={chapter}
      stage={stage}
      clearedCount={countClearedStages(progress, chapter)}
      hintsUsed={attempt.hintsUsed}
      mistakeCount={attempt.mistakeCount}
      onUseHint={attempt.handleUseHint}
    >
      <Board key={attempt.boardKey} stage={stage} onFinish={attempt.handleFinish} />
      <ResultModal
        result={outcome ? outcome.result : null}
        stars={outcome ? outcome.stars : 0}
        conceptCard={findConceptCard(chapter.id, stage.number)}
        onRetry={attempt.handleRetry}
        nextPath={hasNext ? `/chapters/${chapter.id}/stages/${stage.number + 1}` : null}
        listPath={`/chapters/${chapter.id}`}
      />
    </StageLayout>
  );
}

function StagePage() {
  const { chapterId, stageNumber } = useParams();
  const { progress } = useProgress();
  const chapter = findChapter(chapterId);
  const number = Number(stageNumber);

  if (!chapter || !isChapterUnlocked(progress, chapters, chapter.id)) {
    return <Navigate to="/" replace />;
  }
  if (!isStageUnlocked(progress, chapter.id, number)) {
    return <Navigate to={`/chapters/${chapter.id}`} replace />;
  }
  const stage = chapter.stages[number - 1];
  if (!stage || !chapterBoards[chapter.id]) {
    return (
      <main className="page">
        <p className="text-body">이 스테이지는 아직 준비 중이에요.</p>
        <Button to={`/chapters/${chapter.id}`}>스테이지 목록</Button>
      </main>
    );
  }
  return <StageSession key={`${chapter.id}-${number}`} chapter={chapter} stage={stage} />;
}

export default StagePage;
