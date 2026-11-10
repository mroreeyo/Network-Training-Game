import styles from './ProgressBar.module.css';

// 컨베이어 벨트 모양의 가로 막대. 칸 수는 스테이지 수와 같고, 깬 칸만 컨베이어색으로 채운다.
// label은 화면 낭독기가 읽는 설명이다. 넘기지 않으면 done과 total로 만든다.
function ProgressBar({ done, total, label = `스테이지 ${total}개 중 ${done}개 완료` }) {
  const cells = [];
  for (let index = 1; index <= total; index += 1) {
    const doneClass = index <= done ? styles.done : '';
    cells.push(<span key={index} className={`${styles.cell} ${doneClass}`} />);
  }
  return (
    <div className={styles.belt} role="img" aria-label={label}>
      {cells}
    </div>
  );
}

export default ProgressBar;
