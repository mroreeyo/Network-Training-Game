// [라이브러리] react: 힌트·반송 횟수·결과 상태(useState)를 만든다 (자세한 이유는 main.jsx)
import { useState } from 'react';
// [라이브러리] react-router-dom: 주소에서 챕터 id와 스테이지 번호를 읽고 다른 화면으로 보낸다 (자세한 이유는 App.jsx)
import { Navigate, useParams } from 'react-router-dom';
import Button from '../components/common/Button.jsx';
import ResultModal from '../components/common/ResultModal.jsx';
import StageLayout from '../components/common/StageLayout.jsx';
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
// 모든 게임판은 같은 props(stage, onFinish)를 받는다 (계획서 3.5절).
const chapterBoards = {};

// 커스텀 훅을 쓰는 이유: 힌트·반송 횟수·결과 상태와 그 처리 함수가 길어서,
// 화면 코드(StageSession)와 분리해야 함수 하나를 30줄 안에서 읽을 수 있다.
function useStageAttempt(onCleared) {
  const [hintsUsed, setHintsUsed] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [outcome, setOutcome] = useState(null);
  const [boardKey, setBoardKey] = useState(0);

  // 게임판이 판정을 끝내면 부른다. result는 { passed, summary } 또는 { passed, reason, record } 모양이다.
  function handleFinish(result) {
    if (!result.passed) {
      setMistakeCount(mistakeCount + 1);
      setOutcome({ result, stars: 0 });
      return;
    }
    // 실수 횟수는 기본적으로 이 스테이지에서 반송된 횟수다 (계획서 D5).
    // 챕터 4처럼 기준이 다르면 게임판이 결과에 mistakeCount를 담아 보낸다.
    const mistakes = result.mistakeCount === undefined ? mistakeCount : result.mistakeCount;
    const stars = calculateStars({ hintsUsed, mistakeCount: mistakes });
    onCleared(stars);
    setOutcome({ result, stars });
  }

  // 다시 하기: 결과 창을 닫고 게임판을 처음 상태로 되돌린다. 힌트와 반송 횟수는 그대로 둔다.
  function handleRetry() {
    setOutcome(null);
    setBoardKey(boardKey + 1);
  }

  function handleUseHint() {
    setHintsUsed(hintsUsed + 1);
  }

  return { hintsUsed, mistakeCount, outcome, boardKey, handleFinish, handleRetry, handleUseHint };
}

// 한 번의 스테이지 도전. 공통 틀(StageLayout)에 게임판(Board)을 끼우고 결과 화면을 붙인다.
// onCleared(stars)는 스테이지를 깼을 때 불리며, 진행도 저장은 부르는 쪽이 맡는다.
export function StageSession({ chapter, stage, Board, conceptCard, onCleared }) {
  const { progress } = useProgress();
  const attempt = useStageAttempt(onCleared);
  const { outcome } = attempt;
  const hasNext = chapter.stages[stage.number] !== undefined;

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
        conceptCard={conceptCard}
        onRetry={attempt.handleRetry}
        nextPath={hasNext ? `/chapters/${chapter.id}/stages/${stage.number + 1}` : null}
        listPath={`/chapters/${chapter.id}`}
      />
    </StageLayout>
  );
}

// 주소의 스테이지 번호가 1부터 스테이지 수까지의 정수인지 확인한다.
function isValidStageNumber(chapter, number) {
  return Number.isInteger(number) && number >= 1 && number <= chapter.stageCount;
}

function NotReady({ chapter }) {
  return (
    <main className="page">
      <p className="text-body">이 스테이지는 아직 준비 중이에요.</p>
      <Button to={`/chapters/${chapter.id}`}>스테이지 목록</Button>
    </main>
  );
}

// 잠긴 챕터면 월드맵으로, 잠겼거나 없는 스테이지면 스테이지 목록으로 돌려보낸다.
function StagePage() {
  const { chapterId, stageNumber } = useParams();
  const { progress, recordClear } = useProgress();
  const chapter = findChapter(chapterId);
  const number = Number(stageNumber);

  if (!chapter || !isChapterUnlocked(progress, chapters, chapter.id)) {
    return <Navigate to="/" replace />;
  }
  if (!isValidStageNumber(chapter, number) || !isStageUnlocked(progress, chapter.id, number)) {
    return <Navigate to={`/chapters/${chapter.id}`} replace />;
  }
  const stage = chapter.stages[number - 1];
  const Board = chapterBoards[chapter.id];
  if (!stage || !Board) {
    return <NotReady chapter={chapter} />;
  }
  // 스테이지가 바뀌면 key가 바뀌어서 힌트·반송 횟수가 처음부터 시작된다.
  return (
    <StageSession
      key={`${chapter.id}-${number}`}
      chapter={chapter}
      stage={stage}
      Board={Board}
      conceptCard={findConceptCard(chapter.id, number)}
      onCleared={(stars) => recordClear(chapter.id, number, stars)}
    />
  );
}

export default StagePage;
