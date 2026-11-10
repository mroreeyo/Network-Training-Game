import Button from './Button.jsx';
import Card from './Card.jsx';
import styles from './HintBox.module.css';

// 힌트는 스테이지당 최대 2단계다. 1단계든 2단계든 별점은 1개만 줄어든다 (계획서 D4).
// hints의 기본값을 빈 목록으로 두는 이유: 힌트가 없는 스테이지 데이터에서도 화면이 멈추지 않게 하려는 것이다.
function HintBox({ hints = [], hintsUsed, onUseHint }) {
  const shownHints = hints.slice(0, hintsUsed);
  const hasMoreHints = hintsUsed < hints.length;
  const buttonText = hintsUsed === 0 ? '힌트 보기 (별점 1개 감소)' : '힌트 한 단계 더 보기';

  return (
    <div className={styles.box}>
      {shownHints.map((hint, index) => (
        <Card key={hint}>
          <p className="text-label">힌트 {index + 1}단계</p>
          <p>{hint}</p>
        </Card>
      ))}
      {hasMoreHints ? <Button onClick={onUseHint}>{buttonText}</Button> : null}
    </div>
  );
}

export default HintBox;
