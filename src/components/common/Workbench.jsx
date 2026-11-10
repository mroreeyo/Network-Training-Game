import styles from './Workbench.module.css';

// 가운데 단: 작업대. 챕터별 게임판이 이 안을 채운다.
function Workbench({ children }) {
  return (
    <section className={styles.workbench} aria-label="작업대">
      {children}
    </section>
  );
}

export default Workbench;
