import styles from './Card.module.css';

// 운송장 모양의 상자. selected면 테두리가 컨베이어색이 된다.
function Card({ selected = false, className = '', children }) {
  const selectedClass = selected ? styles.selected : '';
  return <div className={`${styles.card} ${selectedClass} ${className}`}>{children}</div>;
}

export default Card;
