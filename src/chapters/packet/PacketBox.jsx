import HeaderLabel from '../../components/common/HeaderLabel.jsx';
import { describeHeaderCard } from '../../rules/packetRules.js';
import styles from './PacketBox.module.css';

// 패킷 상자: 데이터 위에 붙은 라벨이 겹쳐 쌓인다. 화면에는 바깥 헤더가 위에 오도록 뒤집어 쌓는다.
// 안쪽(데이터)부터 적는 이유: 나중에 붙인 라벨이 위에 보여야 "바깥부터 벗긴다"는 규칙이 눈에 보인다.
// onPickLabel을 주면 라벨을 누를 수 있다 (역캡슐화에서 벗길 라벨을 고를 때 쓴다).
function PacketBox({ payload, labels, onPickLabel, children }) {
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
          const pickProps = onPickLabel ? { as: 'button', onClick: () => onPickLabel(card.layer) } : {};
          return (
            <li key={card.id}>
              <HeaderLabel layer={card.layer} name={name} rows={rows} {...pickProps} />
            </li>
          );
        })}
        {children}
      </ol>
    </div>
  );
}

export default PacketBox;
