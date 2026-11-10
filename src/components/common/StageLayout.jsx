import Button from './Button.jsx';
import HintBox from './HintBox.jsx';
import ProgressBar from './ProgressBar.jsx';
import StageHeader from './StageHeader.jsx';
import styles from './StageLayout.module.css';

// 모든 챕터가 같이 쓰는 스테이지 틀. 챕터별 게임판(children)만 끼워 넣는다.
// 위: 작업 지시서(StageHeader + HintBox), 가운데·아래: 게임판이 Workbench와 PartsTray로 채운다.
function StageLayout({ chapter, stage, clearedCount, hintsUsed, mistakeCount, onUseHint, children }) {
  const progressLabel = `스테이지 ${chapter.stageCount}개 중 ${clearedCount}개 완료`;
  return (
    <main className={`page ${styles.stage}`}>
      <nav className={styles.bar} aria-label="스테이지 위치">
        <Button to={`/chapters/${chapter.id}`}>스테이지 목록</Button>
        <div className={styles.progress}>
          <span className="text-quiet numeric">
            챕터 {chapter.number}. {chapter.name}, 스테이지 {chapter.stageCount}개 중 {stage.number}번째
          </span>
          <ProgressBar done={clearedCount} total={chapter.stageCount} label={progressLabel} />
        </div>
      </nav>
      <StageHeader stage={stage} mistakeCount={mistakeCount}>
        <HintBox hints={stage.hints} hintsUsed={hintsUsed} onUseHint={onUseHint} />
      </StageHeader>
      {children}
    </main>
  );
}

export default StageLayout;
