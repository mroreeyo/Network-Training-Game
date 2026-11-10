import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import ProgressBar from '../components/common/ProgressBar.jsx';
import { chapters } from '../data/chapters.js';
import { countClearedStages, isChapterCleared, isChapterUnlocked } from '../rules/progressRules.js';
import { useProgress } from '../ProgressContext.jsx';
import styles from './WorldMapPage.module.css';

// 컨베이어 한 줄이 네 장소를 순서대로 잇는다. 깬 챕터까지만 벨트가 컨베이어색으로 칠해진다.
// 닫혔는지를 먼저 보는 이유: 앞 챕터에 스테이지가 늘어나면 이 챕터는 다 깼어도 닫힌다.
// 깼는지를 먼저 보면 눌러도 스테이지 목록이 안내도로 돌려보내는 버튼이 생긴다.
function getStationState(progress, chapter) {
  if (!isChapterUnlocked(progress, chapters, chapter.id)) {
    return 'locked';
  }
  if (isChapterCleared(progress, chapter)) {
    return 'cleared';
  }
  return 'current';
}

// 앞 챕터는 번호가 아니라 목록 순서로 찾는다. 해금 규칙이 목록 순서를 따르기 때문이다.
function lockedMessage(chapter) {
  const previous = chapters[chapters.indexOf(chapter) - 1];
  return `아직 닫혀 있어요. 챕터 ${previous.number}의 스테이지 ${previous.stageCount}개를 모두 깨면 열려요.`;
}

// 열린 챕터의 표지판 내용이다. 주 버튼은 지금 깨는 중인 챕터 한 곳에만 쓴다.
function OpenSign({ chapter, state, cleared }) {
  let variant = 'secondary';
  let buttonText = '스테이지 다시 보기';
  if (state === 'current') {
    variant = 'primary';
    buttonText = '스테이지 고르기';
  }
  return (
    <>
      <p>{chapter.summary}</p>
      <ProgressBar done={cleared} total={chapter.stageCount} />
      <Button variant={variant} to={`/chapters/${chapter.id}`}>
        {buttonText}
      </Button>
    </>
  );
}

function Station({ chapter, state, cleared }) {
  const side = chapter.number % 2 === 1 ? styles.above : styles.below;
  const label = `챕터 ${chapter.number}. ${chapter.name}`;
  return (
    <li className={`${styles.station} ${styles[state]} ${side}`}>
      <span className={styles.segment} />
      <span className={styles.node} aria-hidden="true">
        {chapter.number}
      </span>
      <Card className={styles.sign}>
        <p className="text-quiet">{chapter.place}</p>
        <h2 className="title-section">{label}</h2>
        {state === 'locked' ? (
          <p>{lockedMessage(chapter)}</p>
        ) : (
          <OpenSign chapter={chapter} state={state} cleared={cleared} />
        )}
      </Card>
    </li>
  );
}

function WorldMapPage() {
  const { progress } = useProgress();
  return (
    <main className="page">
      <header className={styles.header}>
        <h1 className="title-screen">네트워크 물류 센터 안내도</h1>
        <p className="text-body">패킷이 지나가는 길을 따라 네 곳을 차례로 들러요.</p>
      </header>
      <ol className={styles.map}>
        {chapters.map((chapter) => (
          <Station
            key={chapter.id}
            chapter={chapter}
            state={getStationState(progress, chapter)}
            cleared={countClearedStages(progress, chapter)}
          />
        ))}
      </ol>
    </main>
  );
}

export default WorldMapPage;
