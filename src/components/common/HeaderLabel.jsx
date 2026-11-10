import styles from './HeaderLabel.module.css';

// 헤더 라벨(운송장 모양). 계층 띠는 색과 함께 "L2"·"L3"·"L4" 글자를 항상 표시한다.
// as="button"이면 누를 수 있는 라벨이 되고, 기본(div)은 상자에 붙은 라벨을 보여 주기만 한다.
// {...rest}를 먼저 펼치는 이유: dnd-kit이 넘기는 aria-pressed(undefined)가 선택 상태를 지우지 않게 하려는 것이다.
// compact는 좁은 화면에서 카드 이름을 숨긴다 (부품 트레이 제목이 계층을 알려 주기 때문이다).
function HeaderLabel({ as: Tag = 'div', layer, name, rows, selected = false, compact = false, className = '', ...rest }) {
  const selectedClass = selected ? styles.selected : '';
  const compactClass = compact ? styles.compact : '';
  const buttonProps = Tag === 'button' ? { type: 'button', 'aria-pressed': selected } : {};

  return (
    <Tag {...rest} className={`${styles.label} ${selectedClass} ${compactClass} ${className}`} {...buttonProps}>
      <span className={`${styles.layer} ${styles[`layer${layer}`]}`}>
        {layer}
        {selected ? <span className={styles.picked}>선택</span> : null}
      </span>
      <span className={`${styles.body} numeric`}>
        <span className={styles.name}>{name}</span>
        <span className={styles.rows}>
          {rows.map(([label, value]) => (
            <span key={label} className={styles.row}>
              <span className={styles.rowLabel}>{label}</span>
              <span>{value}</span>
            </span>
          ))}
        </span>
      </span>
    </Tag>
  );
}

export default HeaderLabel;
