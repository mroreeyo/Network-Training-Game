import styles from './HeaderLabel.module.css';

// 헤더 라벨(운송장 모양). 계층 띠는 색과 함께 "L2"·"L3"·"L4" 글자를 항상 표시한다.
// as="button"이면 누를 수 있는 라벨이 되고, 기본(div)은 상자에 붙은 라벨을 보여 주기만 한다.
// {...rest}를 먼저 펼치는 이유: dnd-kit이 넘기는 aria-pressed(undefined)가 선택 상태를 지우지 않게 하려는 것이다.
// compact는 좁은 화면에서 카드 이름을 숨긴다 (부품 트레이 제목이 계층을 알려 주기 때문이다).
// selected를 주지 않은 버튼(예: 받는 쪽에서 벗기는 라벨)은 고르는 버튼이 아니라서 aria-pressed를 달지 않는다.
// 기본값을 false로 두면 화면 낭독기가 "전환 버튼, 눌리지 않음"으로 읽는다.
function HeaderLabel({ as: Tag = 'div', layer, name, rows, selected, compact = false, className = '', ...rest }) {
  const selectedClass = selected ? styles.selected : '';
  const compactClass = compact ? styles.compact : '';
  const isButton = Tag === 'button';
  // 보여 주기만 하는 라벨(div)은 누를 수 있는 것처럼 보이면 안 되므로, 손가락 커서와 눌림 표시는 버튼에만 준다.
  const pressableClass = isButton ? styles.pressable : '';
  const buttonProps = isButton ? { type: 'button', 'aria-pressed': selected } : {};
  // CSS에 없는 계층 값은 빈 글자로 둔다. 그대로 넣으면 class에 'undefined'라는 글자가 들어간다.
  const layerClass = styles[`layer${layer}`] || '';
  const classNames = `${styles.label} ${pressableClass} ${selectedClass} ${compactClass} ${className}`;

  return (
    <Tag {...rest} className={classNames} {...buttonProps}>
      <span className={`${styles.layer} ${layerClass}`}>
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
