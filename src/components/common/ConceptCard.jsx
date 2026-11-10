import Card from './Card.jsx';
import styles from './ConceptCard.module.css';

// 스테이지를 깬 뒤 보여 주는 개념 요약 3줄 카드. 결과 화면과 도감 화면이 같이 쓴다.
function ConceptCard({ card }) {
  return (
    <Card>
      <div className={styles.concept}>
        <h3 className="text-label">개념 카드: {card.title}</h3>
        <ul className={styles.lines}>
          {card.lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

export default ConceptCard;
