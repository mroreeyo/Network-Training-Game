import HeaderLabel from '../../components/common/HeaderLabel.jsx';
import { describeHeaderCard } from '../../rules/packetRules.js';
import styles from './PacketBox.module.css';

// 패킷 상자: 데이터 위에 붙은 라벨이 겹쳐 쌓인다. 화면에는 바깥 헤더가 위에 오도록 뒤집어 쌓는다.
// 안쪽(데이터)부터 적는 이유: 나중에 붙인 라벨이 위에 보여야 "바깥부터 벗긴다"는 규칙이 눈에 보인다.
// children에는 라벨 위에 더 그릴 것(카드를 놓을 자리)을 li로 넘긴다.
function PacketBox({ payload, labels, children }) {
  return (
    <div className={styles.box}>
      <h2 className="text-label">패킷 상자</h2>
      <ol className={`${styles.labels} numeric`}>
        <li className={styles.dataSlip}>
          <span className="text-label">데이터</span>
          <span>{payload}</span>
        </li>
        {labels.map((card) => {
          const { name, rows } = describeHeaderCard(card);
          return (
            <li key={card.id}>
              <HeaderLabel layer={card.layer} name={name} rows={rows} />
            </li>
          );
        })}
        {children}
      </ol>
    </div>
  );
}

export default PacketBox;
