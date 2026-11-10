// [라이브러리] react-router-dom: 주소에서 챕터 id를 읽고 다른 화면으로 보내는 도구 (자세한 이유는 App.jsx)
import { Navigate, useParams } from 'react-router-dom';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import ProgressBar from '../components/common/ProgressBar.jsx';
import StarRating from '../components/common/StarRating.jsx';
import { findChapter, chapters } from '../data/chapters.js';
import {
  countClearedStages,
  getStageStars,
  isChapterUnlocked,
  isStageCleared,
  isStageUnlocked,
} from '../rules/progressRules.js';
import { useProgress } from '../ProgressContext.jsx';
import styles from './StageListPage.module.css';

// 열려 있고 스테이지 데이터가 있을 때만 '시작하기' 버튼을 보여 준다.
// 깬 스테이지에는 별점을 함께 보여 준다. 둘 다 없으면 빈 칸을 그리지 않는다 (휴대폰에서 아래 여백이 더 생긴다).
function StageRowSide({ chapter, number, progress, playable }) {
  const cleared = isStageCleared(progress, chapter.id, number);
  if (!cleared && !playable) {
    return null;
  }
  return (
    <div className={styles.side}>
      {cleared ? <StarRating stars={getStageStars(progress, chapter.id, number)} /> : null}
      {playable ? <Button to={`/chapters/${chapter.id}/stages/${number}`}>{cleared ? '다시 하기' : '시작하기'}</Button> : null}
    </div>
  );
}

function StageRow({ chapter, number, progress }) {
  const stage = chapter.stages[number - 1];
  const unlocked = isStageUnlocked(progress, chapter.id, number);
  const title = stage ? stage.title : '준비 중이에요';

  return (
    <li>
      <Card className={styles.row}>
        <div className={styles.text}>
          <h2 className="title-section">
            스테이지 {number}. {title}
          </h2>
          {unlocked ? null : <p className="text-quiet">앞 스테이지를 깨면 열려요.</p>}
        </div>
        <StageRowSide chapter={chapter} number={number} progress={progress} playable={unlocked && stage !== undefined} />
      </Card>
    </li>
  );
}

function StageListPage() {
  const { chapterId } = useParams();
  const { progress } = useProgress();
  const chapter = findChapter(chapterId);

  if (!chapter || !isChapterUnlocked(progress, chapters, chapter.id)) {
    return <Navigate to="/" replace />;
  }

  const cleared = countClearedStages(progress, chapter);
  const numbers = Array.from({ length: chapter.stageCount }, (_, index) => index + 1);
  return (
    <main className="page">
      <header className={styles.header}>
        <Button to="/">센터 안내도</Button>
        <h1 className="title-screen">
          챕터 {chapter.number}. {chapter.name}
        </h1>
        <p className="text-body">{chapter.summary}</p>
        <ProgressBar done={cleared} total={chapter.stageCount} />
      </header>
      <ol className={styles.list}>
        {numbers.map((number) => (
          <StageRow key={number} chapter={chapter} number={number} progress={progress} />
        ))}
      </ol>
    </main>
  );
}

export default StageListPage;
