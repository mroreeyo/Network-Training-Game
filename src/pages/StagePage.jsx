// [라이브러리] react: 힌트·반송 횟수·결과 상태(useState)를 만들고, 다시 하기 뒤에 포커스를 옮긴다(useEffect) (자세한 이유는 main.jsx)
import { useEffect, useState } from 'react';
// [라이브러리] react-router-dom: 주소에서 챕터 id와 스테이지 번호를 읽고 다른 화면으로 보낸다 (자세한 이유는 App.jsx)
import { Navigate, useParams } from 'react-router-dom';
import PacketBoard from '../chapters/packet/PacketBoard.jsx';
import Button from '../components/common/Button.jsx';
import ResultModal from '../components/common/ResultModal.jsx';
import { STAGE_TITLE_ID } from '../components/common/StageHeader.jsx';
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
const chapterBoards = {
  packet: PacketBoard,
};

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

  // 다시 하기: 결과 창을 닫고 게임판을 처음 상태로 되돌린다.
  // 반송된 뒤에는 힌트와 반송 횟수를 그대로 둔다. 깰 때까지의 반송을 세기 때문이다 (계획서 D5).
  // 통과한 뒤에는 새 도전이라서 둘 다 0으로 되돌린다. 그대로 두면 다시 깨도 별점을 올릴 수 없다.
  function handleRetry() {
    if (outcome && outcome.result.passed) {
      setHintsUsed(0);
      setMistakeCount(0);
    }
    setOutcome(null);
    setBoardKey(boardKey + 1);
  }

  function handleUseHint() {
    setHintsUsed(hintsUsed + 1);
  }

  return { hintsUsed, mistakeCount, outcome, boardKey, handleFinish, handleRetry, handleUseHint };
}

// 다시 하기를 누르면 게임판이 새로 만들어져서 키보드 포커스가 화면 맨 앞으로 빠진다.
// 스테이지 제목으로 옮겨서, Tab을 누르면 바로 게임판 쪽으로 이어지게 한다.
// boardKey는 다시 하기를 누를 때마다 1씩 늘어난다. 처음 들어왔을 때(0)는 포커스를 옮기지 않는다.
// 커스텀 훅을 쓰는 이유: StageSession 안에 useEffect를 그대로 적으면 함수 하나가 30줄을 넘는다.
function useFocusTitleAfterRetry(boardKey) {
  useEffect(() => {
    if (boardKey > 0) {
      document.getElementById(STAGE_TITLE_ID).focus();
    }
  }, [boardKey]);
}

// 통과한 뒤 결과 창에서 갈 곳. 챕터의 마지막 스테이지면 다음 스테이지 대신 센터 안내도로 보낸다.
// 다음 챕터가 열렸다는 것을 결과 창에서 바로 알려 준다. 알리지 않으면 안내도에 가 봐야만 알 수 있다.
// 문구를 "열렸어요" 대신 "들어갈 수 있어요"로 쓰는 이유: 이미 깬 마지막 스테이지를 다시 깰 때도 맞는 말이어야 한다.
// 다음 스테이지를 아직 만들지 않았으면 null이다. 마지막인지는 데이터 개수가 아니라 stageCount로 본다.
// 데이터 개수로 보면 스테이지를 만드는 중인 챕터에서 "모두 깼어요"라고 잘못 알린다.
function findNextAfterPass(chapter, stage) {
  if (chapter.stages[stage.number] !== undefined) {
    return { path: `/chapters/${chapter.id}/stages/${stage.number + 1}`, label: '다음 스테이지', notice: null };
  }
  if (stage.number < chapter.stageCount) {
    return null;
  }
  const nextChapter = chapters.find((item) => item.number === chapter.number + 1);
  const notice = nextChapter
    ? `챕터 ${chapter.number}의 스테이지를 모두 깼어요. 센터 안내도에서 챕터 ${nextChapter.number}. ${nextChapter.name}에 들어갈 수 있어요.`
    : '모든 챕터의 스테이지를 깼어요.';
  return { path: '/', label: '센터 안내도로', notice };
}

// 한 번의 스테이지 도전. 공통 틀(StageLayout)에 게임판(Board)을 끼우고 결과 화면을 붙인다.
// onCleared(stars)는 스테이지를 깼을 때 불리며, 진행도 저장은 부르는 쪽이 맡는다.
function StageSession({ chapter, stage, Board, conceptCard, onCleared }) {
  const { progress } = useProgress();
  const attempt = useStageAttempt(onCleared);
  const { outcome } = attempt;
  useFocusTitleAfterRetry(attempt.boardKey);

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
        next={findNextAfterPass(chapter, stage)}
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
