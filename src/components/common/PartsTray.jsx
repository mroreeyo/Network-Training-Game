import styles from './PartsTray.module.css';

// 아래 단: 부품 트레이. 휴대폰에서는 화면 아래에 붙여서 엄지로 닿게 한다.
// 카드는 한 번에 3장 이하로 둔다 (0단계 검수 기록 결정 E).
function PartsTray({ title, children }) {
  return (
    <section className={styles.tray} aria-labelledby="tray-title">
      <h2 className="text-label" id="tray-title">
        {title}
      </h2>
      <ul className={styles.list}>{children}</ul>
    </section>
  );
}

export default PartsTray;
